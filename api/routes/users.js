let express = require('express');
let router = express.Router();
let User = require('../models').user;
let path = require('path');
let env = process.env.NODE_ENV || "development";
let config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
require("dotenv").config();


// Get All admins
router.get('/users', function (req, res) {
  User.findAll().then(users => {
    return res.status(200).json(users); 
  }).catch(err => {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching users.' });
  });
});






module.exports = router;