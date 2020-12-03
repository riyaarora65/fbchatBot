require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const verificationController = require("./controllers/verification");
const messageWebhookController = require("./controllers/messageWebhook");
const mysql = require('mysql');


const mysqlConnection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    port: process.env.DBPORT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if(!err)
       console.log('Connection established successfully');
    else
        console.log('Connection failed', err);
});

const app = express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, () => console.log("Webhook server is listening, port 5000"));

verificationController.controller(app);
messageWebhookController.messagingProcess(app, mysqlConnection);