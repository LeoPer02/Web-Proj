const Sequelize = require('sequelize');
const db = require('../config/database.js');

const Expenses = db.define('expense', {
    user: {
        type: Sequelize.INTEGER
    },
    itemName: {
        type: Sequelize.STRING
    },
    itemId: {
        type: Sequelize.INTEGER
    },
    amount: {
        type: Sequelize.INTEGER
    }
})

module.exports = Expenses;