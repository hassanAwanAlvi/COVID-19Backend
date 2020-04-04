const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Tokens = require('../models/Tokens_tube')
var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var bytes = require('utf8-bytes');
const memberships = require('../utils/config')
const helper_functions = require('../utils/helper')


const auth_next_level = async(req, res, next) => {

    try {

        let secret_key = memberships.secrect_key
        let param_string = ""
        let bytes_utf8 = bytes(secret_key)
        let sha = SHA256(secret_key)


        let new_dict = helper_functions.sortOnKeys(req.body)
        Object.keys(new_dict).forEach(function (key) {
            if (key !== 'hmac')
                param_string += new_dict[key]
        });

        let token = CryptoJS.HmacSHA256(param_string, sha).toString();

        if ( token === req.body.hmac)
        {
            next()
        }
        else
        {
            throw new Error()

        }

        } catch (error) {
            res.status(401).send({error: 'Not authorized to access this resource'})
        }
    }



module.exports = auth_next_level