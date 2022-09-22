const Sequelize = require('sequelize');
const db = require('../config/database.js');

const Employee = db.define('employee', {
    name: {
        type: Sequelize.STRING
    },
    info: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING
    }
})

module.exports = Employee;