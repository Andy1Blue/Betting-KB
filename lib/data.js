/*
 *
 * Library for collecting and editing data from database
 * 
 */

//Dependencies

const mysql = require('mysql');
const config = require('./config');
const helpers = require('./helpers')

//Register new user
register = (user) => {
  return new Promise((res, rej) => {
    let con = mysql.createConnection(config.db);
    const key = helpers.createRandomString(30)
    con.connect(err => {
      if (err) {
        res({error: 'Problem with connecting to the database'})
      } else {
        //conditions

        //adding to db
        con.query(`INSERT INTO register (user_name, user_email, user_password, user_ip, user_key) VALUES ("${user.name}", "${user.email}", "${user.password}","${user.ip}", "${key}")`, err => {
          if (err) {
            res({error:err});
            con.end();
          } else {
            helpers.sendEmail(user.email, key)
            res({message:`Verification email was sent to ${user.email}`});
            con.end();
          }
        })
      }
    })

  })

}

//Get user from db
getUser = (userEmail) => {
  return new Promise((res, rej) => {
    let con = mysql.createConnection(config.db);
    // console.log(userEmail.trim().toUpperCase(), process.env)
    con.connect(err => {
      if (err) {
        res({error: 'Problem with connecting to the database'})
      } else {
        con.query(`SELECT * FROM user WHERE UPPER(user_email) = "${userEmail.trim().toUpperCase()}"`, (err, result) => {
          if (err) {
            res({error:err});
            con.end();
          } else if(result.length > 0) {
            
            res(result);
            con.end();
          } else {
            res({message:`User ${userEmail} does not exist`});
            con.end();
          
          }
        });
      }
    })

  })

}

module.exports = {
  getUser
}
