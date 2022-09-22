const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Item = require('../models/item');
const Sequelize = require('sequelize');
const { requireAuth } = require('../middleware/authSession');
const { json } = require('sequelize');
const User = require('../models/users');
const Expenses = require('../models/expenses');
const jwt = require('jsonwebtoken');

const Op = Sequelize.Op;




// Get list of Items
router.get('/', requireAuth, (req, res) => {
    Item.findAll()
    .then(items => {
        res.render('items', {
            items
        });
    })
    .catch(err => console.log("Error: " + err));
});

// Search Item
router.get('/search', requireAuth, (req, res) => {
    const name = req.query.item_name;
    Item.findAll({ where : { name: { [Op.like]: '%' + name + '%' } }})
    .then(items => {
        res.render('items', {
            items
        });
    })
    .catch(err => res.sendStatus(404))
});

router.get('/:itemId', requireAuth, (req, res) => {
    const item = Item.findOne({where :{id: req.params.itemId}})
    .then(item => {
        res.render('details', {
        item
    });
    })
    .catch(err => console.log(err));
})

router.get('/buy/:itemId', requireAuth, (req, res) => {
    Item.findOne({ where: {id: req.params.itemId}})
    .then(async item => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, 'web secret that should be longer than this', async (err, decodedToken) => {
            if(err){
                res.sendStatus(403);
            }else{
                User.findOne({ where : { id: decodedToken.id}})
                .then(async user => {
                    if(user.balance >= item.price && item.stock > 0){
                        let newValue  = user.balance - item.price;
                        await user.set({
                            balance: newValue
                        });
                        let newStock = item.stock - 1;
                        await item.set({
                            stock: newStock
                        })
                        const expAmount = -item.price;
                        await Expenses.create({
                            user: user.id,
                            itemName: item.name,
                            itemId: item.id,
                            amount: expAmount
                        });

                        user.save();
                        item.save();
                        res.redirect(`/items/${item.id}`);
                    }
                    res.send("You don't have enough balance. You may need to refresh the shop page in order to see the actual balance");
                })
                .catch(err => console.log(err));
            }
        });
    }else{
        req.sendStatus(403);
    }
    })
    .catch(err => console.log(err))
})


module.exports = router;