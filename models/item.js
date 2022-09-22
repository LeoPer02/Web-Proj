const Sequelize = require('sequelize');
const db = require('../config/database.js');

const Item = db.define('item', {
    name: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.INTEGER
    },
    description: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING
    },
    stock: {
        type: Sequelize.INTEGER
    }
})

module.exports = Item;