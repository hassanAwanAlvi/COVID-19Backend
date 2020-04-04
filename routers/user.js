const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const memberships = require('../utils/config')
const helper_functions = require('../utils/helper')
const router = express.Router()
const util = require('util')
const jwt = require('jsonwebtoken')


var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var bytes = require('utf8-bytes');



router.post('/auth/register', async (req, res) => {
    // Create a new user
    try {


        let user = null
        if(req.body.name)
          user = new User(req.body)
        else
        {
          user = new User(req.query)
        }

        user["membership_active"] = false
        user["membership_type"] = memberships.free

        await user.save()

        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

        //Create user on fundist account

        let user_id = helper_functions.makeid(8)
        let password = helper_functions.makeid(10)

        user["evolution_id"] = user_id
        user["evolution_password"] = password

        user["evolution_account_created"] = await create_fundist_user(user_id, password, "157.245.46.27", user.name)
        const token = await user.generateAuthToken()



        user.password = undefined

        res.set('Authorization', token);
        let status = 'success'





        res.status(201).send({ user, token, status })
    } catch (error) {
        if (error.code === 11000)
        {
            res.status(400).send({"message" : "Email already exists, consider signing in" })
        }
        else {
            res.status(400).send(error)
        }
    }
})

async function create_fundist_user(login, password, ip , name) {
    let url = memberships.base_url + "System/Api/4e48e3d2811c3acc83fe640f1090611a/User/Add/?"



    let tid = makeid(32)

    let hash = "User/Add/" + ip +"/"+ tid +"/4e48e3d2811c3acc83fe640f1090611a/"+ login +"/" + password +"/EUR/" +
        "9756809694074458"


    hash = CryptoJS.MD5(hash).toString()

    let params = "Login=" + login +
        "&Password="+ password +
        "&TID="+ tid +"&" +
        "Language=EN&"+
        "Hash="+ hash +"&" +
        "RegistrationIP=" + ip +"&" +
        "Currency=EUR&NAME=" + name


    let valid_response = {
        "status": "OK"
    }

    try {
        const html = await helper_functions.downloadPage(url + params)
        valid_response["url"] = html

    } catch (error) {
        valid_response["url"] = 2
    }

    if (valid_response["url"] === "1")
    {
        return true
    }
    else
    {
        return false

    }
}


router.all('/auth/send_verification_email', auth, async(req, res) => {
    try {
        const send = require('gmail-send')({
            user: 'tubecommand22@gmail.com',
            pass: process.env.Gpass,
            to: req.user.email,
            subject: 'Please confirm your email',
            from : 'Tube Command'
        });


        if (req.user.email_verified) {
            return res.status(400).send({error: "Email already verified"})
        }
        else {


            let code  = makeid(5)
            req.user.addTempEmailToken(code)

            let link = process.env.APP_URL + '/email_verification?code=' + code

            let html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
                '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
                '<head>\n' +
                '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
                '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n' +
                '  <title>Verify your email address</title>\n' +
                '  <style type="text/css" rel="stylesheet" media="all">\n' +
                '    /* Base ------------------------------ */\n' +
                '    *:not(br):not(tr):not(html) {\n' +
                '      font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif;\n' +
                '      -webkit-box-sizing: border-box;\n' +
                '      box-sizing: border-box;\n' +
                '    }\n' +
                '    body {\n' +
                '      width: 100% !important;\n' +
                '      height: 100%;\n' +
                '      margin: 0;\n' +
                '      line-height: 1.4;\n' +
                '      background-color: #F5F7F9;\n' +
                '      color: #839197;\n' +
                '      -webkit-text-size-adjust: none;\n' +
                '    }\n' +
                '    a {\n' +
                '      color: #414EF9;\n' +
                '    }\n' +
                '    /* Layout ------------------------------ */\n' +
                '    .email-wrapper {\n' +
                '      width: 100%;\n' +
                '      margin: 0;\n' +
                '      padding: 0;\n' +
                '      background-color: #F5F7F9;\n' +
                '    }\n' +
                '    .email-content {\n' +
                '      width: 100%;\n' +
                '      margin: 0;\n' +
                '      padding: 0;\n' +
                '    }\n' +
                '    /* Masthead ----------------------- */\n' +
                '    .email-masthead {\n' +
                '      padding: 25px 0;\n' +
                '      text-align: center;\n' +
                '    }\n' +
                '    .email-masthead_logo {\n' +
                '      max-width: 400px;\n' +
                '      border: 0;\n' +
                '    }\n' +
                '    .email-masthead_name {\n' +
                '      font-size: 16px;\n' +
                '      font-weight: bold;\n' +
                '      color: #839197;\n' +
                '      text-decoration: none;\n' +
                '      text-shadow: 0 1px 0 white;\n' +
                '    }\n' +
                '    /* Body ------------------------------ */\n' +
                '    .email-body {\n' +
                '      width: 100%;\n' +
                '      margin: 0;\n' +
                '      padding: 0;\n' +
                '      border-top: 1px solid #E7EAEC;\n' +
                '      border-bottom: 1px solid #E7EAEC;\n' +
                '      background-color: #FFFFFF;\n' +
                '    }\n' +
                '    .email-body_inner {\n' +
                '      width: 570px;\n' +
                '      margin: 0 auto;\n' +
                '      padding: 0;\n' +
                '    }\n' +
                '    .email-footer {\n' +
                '      width: 570px;\n' +
                '      margin: 0 auto;\n' +
                '      padding: 0;\n' +
                '      text-align: center;\n' +
                '    }\n' +
                '    .email-footer p {\n' +
                '      color: #839197;\n' +
                '    }\n' +
                '    .body-action {\n' +
                '      width: 100%;\n' +
                '      margin: 30px auto;\n' +
                '      padding: 0;\n' +
                '      text-align: center;\n' +
                '    }\n' +
                '    .body-sub {\n' +
                '      margin-top: 25px;\n' +
                '      padding-top: 25px;\n' +
                '      border-top: 1px solid #E7EAEC;\n' +
                '    }\n' +
                '    .content-cell {\n' +
                '      padding: 35px;\n' +
                '    }\n' +
                '    .align-right {\n' +
                '      text-align: right;\n' +
                '    }\n' +
                '    /* Type ------------------------------ */\n' +
                '    h1 {\n' +
                '      margin-top: 0;\n' +
                '      color: #292E31;\n' +
                '      font-size: 19px;\n' +
                '      font-weight: bold;\n' +
                '      text-align: left;\n' +
                '    }\n' +
                '    h2 {\n' +
                '      margin-top: 0;\n' +
                '      color: #292E31;\n' +
                '      font-size: 16px;\n' +
                '      font-weight: bold;\n' +
                '      text-align: left;\n' +
                '    }\n' +
                '    h3 {\n' +
                '      margin-top: 0;\n' +
                '      color: #292E31;\n' +
                '      font-size: 14px;\n' +
                '      font-weight: bold;\n' +
                '      text-align: left;\n' +
                '    }\n' +
                '    p {\n' +
                '      margin-top: 0;\n' +
                '      color: #839197;\n' +
                '      font-size: 16px;\n' +
                '      line-height: 1.5em;\n' +
                '      text-align: left;\n' +
                '    }\n' +
                '    p.sub {\n' +
                '      font-size: 12px;\n' +
                '    }\n' +
                '    p.center {\n' +
                '      text-align: center;\n' +
                '    }\n' +
                '    /* Buttons ------------------------------ */\n' +
                '    .button {\n' +
                '      display: inline-block;\n' +
                '      width: 200px;\n' +
                '      background-color: #414EF9;\n' +
                '      border-radius: 3px;\n' +
                '      color: #ffffff;\n' +
                '      font-size: 15px;\n' +
                '      line-height: 45px;\n' +
                '      text-align: center;\n' +
                '      text-decoration: none;\n' +
                '      -webkit-text-size-adjust: none;\n' +
                '      mso-hide: all;\n' +
                '    }\n' +
                '    .button--green {\n' +
                '      background-color: #28DB67;\n' +
                '    }\n' +
                '    .button--red {\n' +
                '      background-color: #FF3665;\n' +
                '    }\n' +
                '    .button--blue {\n' +
                '      background-color: #414EF9;\n' +
                '    }\n' +
                '    /*Media Queries ------------------------------ */\n' +
                '    @media only screen and (max-width: 600px) {\n' +
                '      .email-body_inner,\n' +
                '      .email-footer {\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '    }\n' +
                '    @media only screen and (max-width: 500px) {\n' +
                '      .button {\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '    }\n' +
                '  </style>\n' +
                '</head>\n' +
                '<body>\n' +
                '  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">\n' +
                '    <tr>\n' +
                '      <td align="center">\n' +
                '        <table class="email-content" width="100%" cellpadding="0" cellspacing="0">\n' +
                '          <!-- Logo -->\n' +
                '          <tr>\n' +
                '            <td class="email-masthead">\n' +
                '              <a class="email-masthead_name">TubeCommand.top</a>\n' +
                '            </td>\n' +
                '          </tr>\n' +
                '          <!-- Email Body -->\n' +
                '          <tr>\n' +
                '            <td class="email-body" width="100%">\n' +
                '              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">\n' +
                '                <!-- Body content -->\n' +
                '                <tr>\n' +
                '                  <td class="content-cell">\n' +
                '                    <h1>Verify your email address</h1>\n' +
                '                    <p>Thanks for signing up for TubeCommand! We\'re excited to have you as an early user.</p>\n' +
                '                    <!-- Action -->\n' +
                '                    <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">\n' +
                '                      <tr>\n' +
                '                        <td align="center">\n' +
                '                          <div>\n' +
                '                            <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{action_url}}" style="height:45px;v-text-anchor:middle;width:200px;" arcsize="7%" stroke="f" fill="t">\n' +
                '                            <v:fill type="tile" color="#414EF9" />\n' +
                '                            <w:anchorlock/>\n' +
                '                            <center style="color:#ffffff;font-family:sans-serif;font-size:15px;">Verify Email</center>\n' +
                '                          </v:roundrect><![endif]-->\n' +
                '                            <a href="' + link + '" class="button button--blue" style="color: white">Verify Email</a>\n' +
                '                          </div>\n' +
                '                        </td>\n' +
                '                      </tr>\n' +
                '                    </table>\n' +
                '                    <p>Thanks,<br>The TubeCommand Team</p>\n' +
                '                    <!-- Sub copy -->\n' +
                '                    <table class="body-sub">\n' +
                '                      <tr>\n' +
                '                        <td>\n' +
                '                          <p class="sub">If you’re having trouble clicking the button, copy and paste the URL below into your web browser.\n' +
                '                          </p>\n' +
                '                          <p class="sub"><a href="' + link + '"> ' + link + '</a></p>\n' +
                '                        </td>\n' +
                '                      </tr>\n' +
                '                    </table>\n' +
                '                  </td>\n' +
                '                </tr>\n' +
                '              </table>\n' +
                '            </td>\n' +
                '          </tr>\n' +
                '          <tr>\n' +
                '            <td>\n' +
                '              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0">\n' +
                '                <tr>\n' +
                '                  <td class="content-cell">\n' +
                '                    <p class="sub center">\n' +
                '                      TubeCommand Inc.\n' +
                '                      <br>TubeCommand\n' +
                '                    </p>\n' +
                '                  </td>\n' +
                '                </tr>\n' +
                '              </table>\n' +
                '            </td>\n' +
                '          </tr>\n' +
                '        </table>\n' +
                '      </td>\n' +
                '    </tr>\n' +
                '  </table>\n' +
                '</body>\n' +
                '</html>'

            const {result, full} = await send({
                html: html
            });


            return res.send({"status" : "Email sent"})
        }
    } catch (error) {
        return res.status(401).send({ error: "Unable to send email, Please try again later"})
    }

})


router.all('/auth/send_password_recovery_email', async(req, res) => {
    try {

        if (!req.body.email)
        {
            return res.status(400).send({error : "Email is missing"})
        }
        const user = await User.findByEmail(req.body.email)


        const send = require('gmail-send')({
            user: 'tubecommand22@gmail.com',
            pass: process.env.Gpass,
            to: req.body.email,
            subject: 'Recover your password',
            from: 'Tube Command'
        });





        let code = makeid(10)
        user.addTempPasswordToken(code)

        let link = process.env.APP_URL + '/change_password?code=' + code + '&email=' + req.body.email


        let html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
            '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
            '<head>\n' +
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
            '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n' +
            '  <title>Recover Password</title>\n' +
            '  <style type="text/css" rel="stylesheet" media="all">\n' +
            '    /* Base ------------------------------ */\n' +
            '    *:not(br):not(tr):not(html) {\n' +
            '      font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif;\n' +
            '      -webkit-box-sizing: border-box;\n' +
            '      box-sizing: border-box;\n' +
            '    }\n' +
            '    body {\n' +
            '      width: 100% !important;\n' +
            '      height: 100%;\n' +
            '      margin: 0;\n' +
            '      line-height: 1.4;\n' +
            '      background-color: #F5F7F9;\n' +
            '      color: #839197;\n' +
            '      -webkit-text-size-adjust: none;\n' +
            '    }\n' +
            '    a {\n' +
            '      color: #414EF9;\n' +
            '    }\n' +
            '    /* Layout ------------------------------ */\n' +
            '    .email-wrapper {\n' +
            '      width: 100%;\n' +
            '      margin: 0;\n' +
            '      padding: 0;\n' +
            '      background-color: #F5F7F9;\n' +
            '    }\n' +
            '    .email-content {\n' +
            '      width: 100%;\n' +
            '      margin: 0;\n' +
            '      padding: 0;\n' +
            '    }\n' +
            '    /* Masthead ----------------------- */\n' +
            '    .email-masthead {\n' +
            '      padding: 25px 0;\n' +
            '      text-align: center;\n' +
            '    }\n' +
            '    .email-masthead_logo {\n' +
            '      max-width: 400px;\n' +
            '      border: 0;\n' +
            '    }\n' +
            '    .email-masthead_name {\n' +
            '      font-size: 16px;\n' +
            '      font-weight: bold;\n' +
            '      color: #839197;\n' +
            '      text-decoration: none;\n' +
            '      text-shadow: 0 1px 0 white;\n' +
            '    }\n' +
            '    /* Body ------------------------------ */\n' +
            '    .email-body {\n' +
            '      width: 100%;\n' +
            '      margin: 0;\n' +
            '      padding: 0;\n' +
            '      border-top: 1px solid #E7EAEC;\n' +
            '      border-bottom: 1px solid #E7EAEC;\n' +
            '      background-color: #FFFFFF;\n' +
            '    }\n' +
            '    .email-body_inner {\n' +
            '      width: 570px;\n' +
            '      margin: 0 auto;\n' +
            '      padding: 0;\n' +
            '    }\n' +
            '    .email-footer {\n' +
            '      width: 570px;\n' +
            '      margin: 0 auto;\n' +
            '      padding: 0;\n' +
            '      text-align: center;\n' +
            '    }\n' +
            '    .email-footer p {\n' +
            '      color: #839197;\n' +
            '    }\n' +
            '    .body-action {\n' +
            '      width: 100%;\n' +
            '      margin: 30px auto;\n' +
            '      padding: 0;\n' +
            '      text-align: center;\n' +
            '    }\n' +
            '    .body-sub {\n' +
            '      margin-top: 25px;\n' +
            '      padding-top: 25px;\n' +
            '      border-top: 1px solid #E7EAEC;\n' +
            '    }\n' +
            '    .content-cell {\n' +
            '      padding: 35px;\n' +
            '    }\n' +
            '    .align-right {\n' +
            '      text-align: right;\n' +
            '    }\n' +
            '    /* Type ------------------------------ */\n' +
            '    h1 {\n' +
            '      margin-top: 0;\n' +
            '      color: #292E31;\n' +
            '      font-size: 19px;\n' +
            '      font-weight: bold;\n' +
            '      text-align: left;\n' +
            '    }\n' +
            '    h2 {\n' +
            '      margin-top: 0;\n' +
            '      color: #292E31;\n' +
            '      font-size: 16px;\n' +
            '      font-weight: bold;\n' +
            '      text-align: left;\n' +
            '    }\n' +
            '    h3 {\n' +
            '      margin-top: 0;\n' +
            '      color: #292E31;\n' +
            '      font-size: 14px;\n' +
            '      font-weight: bold;\n' +
            '      text-align: left;\n' +
            '    }\n' +
            '    p {\n' +
            '      margin-top: 0;\n' +
            '      color: #839197;\n' +
            '      font-size: 16px;\n' +
            '      line-height: 1.5em;\n' +
            '      text-align: left;\n' +
            '    }\n' +
            '    p.sub {\n' +
            '      font-size: 12px;\n' +
            '    }\n' +
            '    p.center {\n' +
            '      text-align: center;\n' +
            '    }\n' +
            '    /* Buttons ------------------------------ */\n' +
            '    .button {\n' +
            '      display: inline-block;\n' +
            '      width: 200px;\n' +
            '      background-color: #414EF9;\n' +
            '      border-radius: 3px;\n' +
            '      color: #ffffff;\n' +
            '      font-size: 15px;\n' +
            '      line-height: 45px;\n' +
            '      text-align: center;\n' +
            '      text-decoration: none;\n' +
            '      -webkit-text-size-adjust: none;\n' +
            '      mso-hide: all;\n' +
            '    }\n' +
            '    .button--green {\n' +
            '      background-color: #28DB67;\n' +
            '    }\n' +
            '    .button--red {\n' +
            '      background-color: #FF3665;\n' +
            '    }\n' +
            '    .button--blue {\n' +
            '      background-color: #414EF9;\n' +
            '    }\n' +
            '    /*Media Queries ------------------------------ */\n' +
            '    @media only screen and (max-width: 600px) {\n' +
            '      .email-body_inner,\n' +
            '      .email-footer {\n' +
            '        width: 100% !important;\n' +
            '      }\n' +
            '    }\n' +
            '    @media only screen and (max-width: 500px) {\n' +
            '      .button {\n' +
            '        width: 100% !important;\n' +
            '      }\n' +
            '    }\n' +
            '  </style>\n' +
            '</head>\n' +
            '<body>\n' +
            '  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">\n' +
            '    <tr>\n' +
            '      <td align="center">\n' +
            '        <table class="email-content" width="100%" cellpadding="0" cellspacing="0">\n' +
            '          <!-- Logo -->\n' +
            '          <tr>\n' +
            '            <td class="email-masthead">\n' +
            '              <a class="email-masthead_name">TubeCommand.top</a>\n' +
            '            </td>\n' +
            '          </tr>\n' +
            '          <!-- Email Body -->\n' +
            '          <tr>\n' +
            '            <td class="email-body" width="100%">\n' +
            '              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">\n' +
            '                <!-- Body content -->\n' +
            '                <tr>\n' +
            '                  <td class="content-cell">\n' +
            '                    <h1>Recover your password</h1>\n' +
            '                    <p>If you didn\'t send this email, just ignore it</p>\n' +
            '                    <!-- Action -->\n' +
            '                    <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">\n' +
            '                      <tr>\n' +
            '                        <td align="center">\n' +
            '                          <div>\n' +
            '                            <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{action_url}}" style="height:45px;v-text-anchor:middle;width:200px;" arcsize="7%" stroke="f" fill="t">\n' +
            '                            <v:fill type="tile" color="#414EF9" />\n' +
            '                            <w:anchorlock/>\n' +
            '                            <center style="color:#ffffff;font-family:sans-serif;font-size:15px;">Verify Email</center>\n' +
            '                          </v:roundrect><![endif]-->\n' +
            '                            <a href="' + link + '" class="button button--blue" style="color: white">Recover Password</a>\n' +
            '                          </div>\n' +
            '                        </td>\n' +
            '                      </tr>\n' +
            '                    </table>\n' +
            '                    <p>Thanks,<br>The TubeCommand Team</p>\n' +
            '                    <!-- Sub copy -->\n' +
            '                    <table class="body-sub">\n' +
            '                      <tr>\n' +
            '                        <td>\n' +
            '                          <p class="sub">If you’re having trouble clicking the button, copy and paste the URL below into your web browser.\n' +
            '                          </p>\n' +
            '                          <p class="sub"><a href="' + link + '"> ' + link + '</a></p>\n' +
            '                        </td>\n' +
            '                      </tr>\n' +
            '                    </table>\n' +
            '                  </td>\n' +
            '                </tr>\n' +
            '              </table>\n' +
            '            </td>\n' +
            '          </tr>\n' +
            '          <tr>\n' +
            '            <td>\n' +
            '              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0">\n' +
            '                <tr>\n' +
            '                  <td class="content-cell">\n' +
            '                    <p class="sub center">\n' +
            '                      TubeCommand Inc.\n' +
            '                      <br>TubeCommand\n' +
            '                    </p>\n' +
            '                  </td>\n' +
            '                </tr>\n' +
            '              </table>\n' +
            '            </td>\n' +
            '          </tr>\n' +
            '        </table>\n' +
            '      </td>\n' +
            '    </tr>\n' +
            '  </table>\n' +
            '</body>\n' +
            '</html>'

        const {result, full} = await send({
            html: html
        });


        return res.send({"status": "Email sent"})

    } catch (error) {
        return res.status(401).send({ error: "Unable to send email, Please try again later"})
    }

})

router.get('/auth/check_email_verification_code', auth, async(req, res) => {
    try {
        if (req.user.email_verified) {
            return res.status(400).send({error: "Email already verified"})
        }
        else {

            if (req.query.code)
            {
                if (req.query.code === req.user.temp_email_pass)
                {
                    req.user.makeEmailVerified()
                    return res.send({"status" : "Email confirmed"})
                }
                else
                {
                    return res.status(400).send({ error: "Invalid code"})
                }
            }
            else
            {
                return res.status(400).send({ error: "Code is required"})
            }

        }
    } catch (error) {
        return res.status(500).send({ error: "Server error"})
    }

})


router.get('/auth/check_password_verification_code', async(req, res) => {
    try {
        if (!req.query.email || !req.query.code || !req.query.password) {
            return res.status(400).send({error: "Email and Code and Password are required"})
        }
        else {

            if (req.query.code)
            {
                const user = await User.findByEmail(req.query.email)

                if (req.query.code === user.temp_pass_token)
                {
                    user.temp_pass_token = makeid(15)
                    user.password = req.query.password
                    user.tokens.splice(0, user.tokens.length)
                    await user.save()


                    return res.send({"status" : "Password changed "})
                }
                else
                {
                    return res.status(400).send({ error: "Session expired"})
                }
            }
            else
            {
                return res.status(400).send({ error: "Code is required"})
            }

        }
    } catch (error) {
        return res.status(500).send({ error: "Server error"})
    }

})

router.post('/auth/login', async(req, res) => {
    //Login a registered user
    try {

        let email, password
        if(req.body.password) {
            email = req.body.email
            password = req.body.password
        }
        else {
            email = req.query.email
            password = req.query.password
        }

        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }

        if (!user.evolution_account_created) {
            user.evolution_account_created = await create_fundist_user(user.evolution_id, user["evolution_password"], "157.245.46.27", user.name)
        }


        const token = await user.generateAuthToken()
        user.password = undefined
        user.tokens = undefined
        res.set('Authorization', token);
        let status = 'success'


        res.send({ user, token, status })
    } catch (error) {
        // console.log(error)
        res.status(401).send({ error: 'Invalid login credentials' })
    }

})


router.post('/auth/request_invitation_code', async(req, res) => {
    //Login a registered user
    try {


        let email, password, name, hear_about_us, position, channel_name

        email = req.body.email
        password = req.body.password
        name = req.body.name
        hear_about_us = req.body.hear_about_us
        position = req.body.position
        channel_name = req.body.channel_name


        let invitation_code = null
        if(req.body.channel_name)
            invitation_code  = new Invitation_code(req.body)



        await invitation_code.save()
        let status = 'success'

        res.status(201).send({ invitation_code, status })

    } catch (error) {
        // console.log(error)
        res.status(400).send({ error: 'We believe you have already registered' })
    }

})


router.post('/auth/change_password', auth, async(req, res) => {
    //Login a registered user
    try {

        let current_password, new_password
        if(req.body.current_password) {
            current_password = req.body.current_password
            new_password = req.body.new_password
        }
        else {
            current_password = req.query.current_password
            new_password = req.query.new_password
        }

        const user = await User.findByCredentials(req.user.email, current_password)

        if (!user) {
            return res.status(401).send({error: 'Invalid Password'})
        }


        req.user.password = new_password
        await req.user.save()


        let response = {
            "status" : true,
            "message" : "Password has been changed"
        }

        res.send(response )
    } catch (error) {
        // console.log(error)
        res.status(401).send({ error: 'Invalid login credentials' })
    }

})


router.post('/auth/activate_token', auth, async(req, res) => {
    //Login a registered user
    try {

        let token, new_password
        if(req.body.token) {
            token = req.body.token
        }
        else {
            token = req.query.token
            }


            const main_token = await Tokens.findByName(token)
            if( !main_token )
            {
                res.status(400).send({ error: 'Invalid Tokens' })
                return
            }

            if (main_token.count_left <= 0)
            {

                res.status(400).send({ error: 'No more tokens left ' })
                return
            }
        main_token.count_left = main_token.count_left - 1
        await main_token.save()

        const user = req.user
        const now = Date.now(); // Unix timestamp in milliseconds

        const session = {
            subscription : "via_token",
            "token" : token,
            billing : "OneTime",
            created : now,
            plan : {
                nickname : token,
                amount : 10000
            }
        }
        user.addPayments(session)
        user.addBillings(session)



        let response = {
            "status" : true,
            "message" : "Your membership has been updated"
        }

        res.send( response )
    } catch (error) {
        // console.log(error)
        res.status(400).send({ error: 'Invalid login credentials' })
    }

})




router.get('/auth/user', auth, async(req, res) => {
    // View logged in user profile

    req.user.password = undefined
    req.user.tokens = undefined
    req.user.temp_email_pass = undefined
    res.send(req.user)
})


router.post('/auth/add_balance', auth, async(req, res) => {
    // View logged in user profile

    try {

        // if(req.body.balance)


        let balance = req.body.balance

        let new_balance = await add_balance(req.user.evolution_id, balance, "157.245.46.27")

        let user = req.user
        user.evolution_balance = new_balance
        await user.save()

        req.user.password = undefined
        req.user.tokens = undefined
        req.user.temp_email_pass = undefined

        req.user.evolution_balance = new_balance



        res.send(req.user)
    }
    catch (e) {
        res.status(400).send({"message" : "Unable to add balance" })
    }

})


router.get('/auth/refresh', auth, async(req, res) => {
    // USED FOR AUTH GUARD IN FRONT END

    let status  = true
    res.send( { status } )
})

router.post('/auth/logout', async (req, res) => {
    // Log user out of the application
    try {



        let token_ = null
        if(req.body.token) {
            token_ = req.body.token
        }
        else {
            token_ = req.query.token
        }

        let response = {
            "status" : false,
            "message" : "Token is missing"
        }

        if (!token_) {
            res.status(400).send(response)
            return
        }

        const data = jwt.verify(token_, process.env.JWT_KEY)
        const user = await User.findOne({_id: data._id, 'tokens.token': token_})
        if (!user) {
            response["message"] = "Invalid user"
            res.status(400).send(response)
            return
        }
        req.user = user
        req.token = token_

        response = {
            "status" : true,
            "message" : "You have logged out successfully"
        }
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != token_
        })
        await req.user.save(response)
        res.send(response)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/auth/logout_all', auth, async(req, res) => {
    // Log user out of all devices
    try {
        let response = {
            "status" : true,
            "message" : "You have logged out from all sessions successfully"
        }

        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send(response)
    } catch (error) {
        res.status(500).send(error)
    }
})

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



async function add_balance(login, balance , ip) {
    let url = memberships.base_url + "System/Api/4e48e3d2811c3acc83fe640f1090611a/Balance/Set/?"



    let tid = makeid(32)

    let hash = "Balance/Set/" + ip +"/"+ tid +"/4e48e3d2811c3acc83fe640f1090611a/998/"+ balance + "/" + login +"/EUR/" +
        "9756809694074458"


    hash = CryptoJS.MD5(hash).toString()

    let params = "Login=" + login +
        "&Amount="+ balance +
        "&TID="+ tid +"&" +
        "Language=EN&System=998&"+
        "Hash="+ hash +"&" +
        "Currency=EUR"



    let valid_response = ""
    try {
        const html = await helper_functions.downloadPage(url + params)
        valid_response = html + ""

    } catch (error) {
        valid_response = "2"
    }

    if (valid_response.substring(0,1) === "1")
    {
        return valid_response.substring(2);
    }
    else
    {
        return null

    }
}


module.exports = router