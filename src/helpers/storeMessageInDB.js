const storeMessageInDB = (senderId, message, mysqlConnection) => 
{
    mysqlConnection.query("Insert into messages(uid,message) VALUES(?,?)",
        [senderId, message], function (err, results) 
        {
            if (err) {
                console.log(err.sqlMessage);
            }
        });
}

module.exports = storeMessageInDB;