const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Employee = require('../models/employee');



// Get list of Employees
router.get('/', (req, res) => {
    Employee.findAll()
    .then(employee => {
        res.render('about', {
            employee
        });
    })
    .catch(err => console.log("Error: " + err));
});

module.exports = router;