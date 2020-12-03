const processMessage = require("../helpers/processMessage");


const messagingProcess = (app, mysqlConnection) => {
    app.post('/webhook', (req, res) => 
{ 
    let body = req.body;

    if (body.object === "page") 
    {
        body.entry.forEach(entry => 
        {
            entry.messaging.forEach(event => 
            {
                if (event.message && event.message.text)
                {
                    processMessage(event, mysqlConnection);
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    }
    else {
        res.sendStatus(404);
    }
});

}

module.exports = {
    messagingProcess: messagingProcess
};