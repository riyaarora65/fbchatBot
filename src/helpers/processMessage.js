const constants = require('../constants');
const apiAiClient = require("apiai")(constants.API_AI_TOKEN);
const request = require("request");
const storeMessageInDB = require('./storeMessageInDB');


let username = '';
let password = '';
let email = '';
let DOB = '';
let userLoggedIn = false;
let isUserNew = false;

const sendTextMessage = (senderId, text) => {
    request
        ({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: {
                access_token: constants.FACEBOOK_ACCESS_TOKEN
            },
            method: "POST",
            json:
            {
                recipient: { id: senderId },
                message: { text },
            }
        });
};

const checkUser = (senderId, mysqlConnection) => {
    mysqlConnection.query("Select * from userdata where user_id=?", [senderId],
        function (err, results) {
            if (err) {
                return next(err.sqlMessage);
            }
            else {
                if (results.length === 0)
                    isUserNew = true;
                else
                    isUserNew = false;
            }
        });
}

const addUserDetailsToDB = (senderId, username, password, email, DOB, mysqlConnection) => 
{
    mysqlConnection.query("Insert into userdata(user_id,user_name,password,email,DOB) VALUES(?,?,?,?,?)",
        [senderId, username, password, email, DOB], function (err, results) {
            if (err) {
                console.log(err.sqlMessage);
            }
            else {
                console.log(results);
                userLoggedIn = true;
            }
        });
}

const validateUser = (senderId, mysqlConnection, username, password) => 
{
    mysqlConnection.query("Select * from userdata where user_id=?", [senderId],
    function(err, results)
    {
        if(err)
            console.log(err.sqlMessage);
        else 
        {
            if(results[0].user_name === username && results[0].password === password)
            {
                userLoggedIn = true;
                sendTextMessage(senderId, 'Logged in successfully.Please ask your queries!');
            }    
        }
    });
}

module.exports = (event, mysqlConnection) => {
    const senderId = event.sender.id;
    const message = event.message.text;

    storeMessageInDB(senderId, message, mysqlConnection);

    if (!isUserNew)
        checkUser(senderId, mysqlConnection);

    const apiaiSession = apiAiClient.textRequest(message, { sessionId: "enterprisebot_bot" });

    apiaiSession.on("response", (response) => 
    {
        const action = response.result.action;

        if (action === constants.ACTION_FETCH_USERNAME)
            username = response.result.parameters.username;
        if (action === constants.ACTION_FETCH_PASSWORD)
            password = response.result.parameters.password;

        if (isUserNew)
        {
            if (action === constants.ACTION_FETCH_EMAIL)
                email = response.result.parameters.email;

            if (action === constants.ACTION_FETCH_DOB)
                DOB = response.result.parameters.BirthDate;

            if (username !== '' && password !== '' && email !== '' && DOB !== '' && !userLoggedIn)
                addUserDetailsToDB(senderId, username, password, email, DOB, mysqlConnection);
        }
        else 
        {
            if (username !== '' && password !== '' && !userLoggedIn)
                validateUser(senderId, mysqlConnection, username, password)
        }


        const result = response.result.fulfillment.speech;
        sendTextMessage(senderId, result);
    });

    apiaiSession.on("error", error => console.log(error));
    apiaiSession.end();
};