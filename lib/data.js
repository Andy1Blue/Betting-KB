/*
 *
 * Library for collecting and editing data from database
 * 
 */

//Dependencies

const mysql = require('mysql');
const config = require('./config');
// const helpers = require('./helpers')

//Register new user
register = (user) => {

  let  

}

//Get user from db
getUser = (userEmail) => {
  return new Promise((res, rej) => {
    let con = mysql.createConnection(config.db);
    console.log(userEmail.trim().toUpperCase())
    con.connect((err) => {
      if (err) {
        res({error: 'Problem with connecting to the database'})
      } else {
        con.query(`SELECT * FROM user WHERE UPPER(user_email) = "${userEmail.trim().toUpperCase()}"`, (err, result) => {
          if (err) {
            res({error:err});
            con.end();
          } else {
            if (result.length > 0) {
              res(result);
              con.end();
            } else {
              res({message:'User does not exist'});
              con.end();
            }
          }
        });
      }
    })

  })

}

module.exports = {
  getUser
}
