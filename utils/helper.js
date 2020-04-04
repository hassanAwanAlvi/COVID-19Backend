var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var bytes = require('utf8-bytes');


const memberships = require('./config')

function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i]._source.id === nameKey) {
            return { data : myArray[i] , index : i };
        }
    }

    return { data : null , index : -1 };
}

const request = require('request');
// wrap a request in an promise
function downloadPage(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}






let export_func = { search}

module.exports = export_func