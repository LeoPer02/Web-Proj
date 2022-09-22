const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bodyParser = require("body-parser");
const User = require('../models/users');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const { body, validationResult, Result } = require('express-validator');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { requireAuth, checkUser} = require('../middleware/authSession');
const Expenses = require('../models/expenses');


// jwt
const maxAge = 24*60*60; //3 days
const createToken = (id) =>{
    return jwt.sign({ id }, 'web secret that should be longer than this', {
        expiresIn: maxAge
    });
}


router.get('/signup', (req,res) => {
    res.render('signup');
})

router.get('/', (req, res) => {
    res.render('login');
})


// Login
router.post('/login', async (req, res) => {
    const mail = req.body.email_input;
    const pw = req.body.pw_input;
    const username = req.body.username;
    const user = await User.findOne({ where: {email: mail}});
    const match = await bcrypt.compare(pw, user.pass);
    if(match){
        console.log('Login was a success, redirecting...');
        const token = createToken(user.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge*1000})   
        res.redirect('/');
    } 
    else{
        const errs = [{text: 'No account found'}];
        console.log(errs);
        res.render('login', {errs, mail, username});
    }
})

router.post('/signup', async (req, res) => {
    const email = req.body.email_input;
    const password1 = req.body.pw_input;
    const password2 = req.body.pw_input2;
    const username = req.body.username;
    let errors = [];
    const validateStrongPassword = body("pw_input")
    .isLength({ min: 6 })

    if(!email){
        errors.push({ text: 'Please Insert Email'});
    }
    if(!password1){
        errors.push({ text: 'Please Insert Password'});
    }
    if(!password2){
        errors.push({ text: 'Please confirm Password'});
    }/*
    if(!validateStrongPassword && password1){
        errors.push({text: 'Password not strong enough'});
    }*/

    if(!username) {
        errors.push({ text: 'Please Insert Username'})
    }

    if(password1 != password2 && password2 && password1){
        errors.push({ text: 'Passwords do not match'});
    }
    var ex = await User.findOne({ where: {email}})
    if(ex) {
        errors.push({ text: 'Email is Invalid or already in use'});
    }

    ex = await User.findOne({ where: {username}})
    if(ex) {
        errors.push({ text: 'Username already in use'});
    }
    
    if(errors.length > 0){
        console.log(errors);
        res.render('signup', {errors, email, username});
    }else{
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password1, salt, function(err, hash){
                User.create({
                    email,
                    pass: hash,
                    username
                })
                .then(user => {
                    const token = createToken(user.id);
                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge*1000})
                    res.redirect('/');
                })
                .catch(err => {console.log(err); res.sendStatus(404)});
            });
        });
    }

}
);

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
})

router.get('/expenses/:userId', requireAuth, (req, res) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'web secret that should be longer than this', async (err, decodedToken) => {
            if(err){
                res.sendStatus(403);
            }else{
                if(decodedToken.id == req.params.userId){
                    const userId = req.params.userId;
                    Expenses.findAll({where: {user: userId}})
                    .then(expenses => {
                        res.render('expenses', {
                            expenses
                        })
                    })
                    .catch(err => console.log(err));
                }else{
                    res.sendStatus(403);
                }
            }
        });
    }else{
        res.sendStatus(403);
    }
})

router.post('/delete_expenses/:expenseId/:userId', requireAuth, async (req, res) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'web secret that should be longer than this', async (err, decodedToken) => {
            if(err){
                res.sendStatus(403);
            }else{
                if(decodedToken.id == req.params.userId){
                    const userId = req.params.userId;
                    const expenseId = req.params.expenseId;
                    const exp = await Expenses.findOne({where: {id: expenseId}});
                    try{
                        if(userId == exp.user){
                            await exp.destroy();
                            try{
                            Expenses.findAll({ where: {user: userId}})
                            .then(expenses => {
                                res.redirect(`/connect/expenses/${userId}`);
                            })
                            .catch(err => console.log(err))
                        }catch(err){
                            console.log(err);
                        }
                        }else{
                            res.sendStatus(403);
                        }
                    }catch(err){
                        console.log(err);
                    }
                }else{
                    res.sendStatus(403);
                }
            }
        });
    }else{
        res.sendStatus(403);
    }
})




module.exports = router;