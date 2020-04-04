const express = require('express')
const User = require('../models/User')

const memberships = require('../utils/config')
const router = express.Router()
const helper_functions = require('../utils/helper')

var CryptoJS = require("crypto-js");



router.all('/ping', async (req, res) => {
    let valid_response = {
        "status": "OK"
    }
    res.status(201).send(valid_response)
})

router.all('/add_inventory', async (req, res) => {
    let valid_response = {
        "status": "OK"
    }


    let user = null
    if(req.body.nic)
        user = new User(req.body)
    else
    {
        user = new User(req.query)
    }

    await user.save()

    res.status(201).send(valid_response)
})

router.all('/search_inventory', async (req, res) => {
    let valid_response = {
        "status": "OK"
    }

    let id  = req.body.nic
    let ids = await User.findByID(id)

    valid_response["nic"] = ids

    res.status(201).send(valid_response)
})




module.exports = router