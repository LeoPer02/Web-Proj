const jwt = require('jsonwebtoken');
const User = require('../models/users');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, 'web secret that should be longer than this', (err, decodedToken) => {
            if(err){
                res.redirect('/connect');
            }else{
                next();
            }
        })
    }else{
        res.redirect('/connect');
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, 'web secret that should be longer than this', async (err, decodedToken) => {
            if(err){
                res.locals.user = null;
                next();
            }else{
                let user = await User.findOne({ where : { id: decodedToken.id}})
                console.log("Email "  + user.email);
                res.locals.user = user;
                next();
            }
        });
    }else{
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser};