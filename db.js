const mysql = require('mysql2');

const db = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: 'toxic',
    database: 'smart_parking'
});

db.connect((err) => {

    if(err){
        console.log(err);
    } else {
        console.log('MySQL Connected');
    }
});

module.exports = db;