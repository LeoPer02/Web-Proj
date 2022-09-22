const Sequelize = require('sequelize');
const db = require('../config/database.js');

const User = db.define('user', {
    email: {
        type: Sequelize.STRING
    },
    pass: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    balance: {
        type: Sequelize.INTEGER
    }
})

module.exports = User;