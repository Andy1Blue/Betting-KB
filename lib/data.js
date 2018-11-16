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
        rej(err);
      } else {
        //TODO add conditions
        
        //check is user exist
        getUser('user', 'user_email', user.email).then(userFromDB => {
          console.log(userFromDB)
          if(Array.isArray(userFromDB) && userFromDB[0].user_email) {
            res({message:`User ${user.email} already exist`});
            con.end();
          }else {
            //check is user exist in register
            getUser('register', 'user_ip', user.ip).then(userFromDB => {
              if(Array.isArray(userFromDB) && userFromDB[0].date) {
                res({message:`User ${user.email} already exist`});
                con.end();
              }
            })
            
            //adding to db
            con.query(`INSERT INTO register (user_name, user_email, user_password, user_ip, user_key) VALUES ("${user.name}", "${user.email}", "${user.password}","${user.ip}", "${key}")`, err => {
              if (err) {
                res({error:err});
                con.end();
              } else {
                // helpers.sendEmail(user.email, key)
                res({message:`Verification email was sent to ${user.email}`});
                con.end();
              }
            })
          }
          
        })
        // console.log(isUserExist)
        
      }
    })
    
  })
  
}
//Test
test = (tab, tabField, query) => {
  return new Promise((res, rej) => {
    let con = mysql.createConnection(config.db);
    con.connect(err => {
      if (err) {
        rej(err)
      } else {
        con.query(`SELECT * FROM ${tab} WHERE UPPER(${tabField}) = "${query.trim().toUpperCase()}"`, (err, result) => {
          if (err) {
            res({error:err});
            con.end();
          } else if(result.length > 0) {
            
            res(result);
            con.end();
          } else {
            res({message:`User ${query} does not exist`});
            con.end();
          
          }
        });
      }
    })
  })
}

//Get user from db
getUser = (tab, tabField, query) => {
  let dat = Date.now();
  
  console.log(dat)
  return new Promise((res, rej) => {
    let con = mysql.createConnection(config.db);
    // console.log(userEmail.trim().toUpperCase(), process.env)
    con.connect(err => {
      if (err) {
        rej(err)
      } else {
        con.query(`SELECT * FROM ${tab} WHERE UPPER(${tabField}) = "${query.trim().toUpperCase()}"`, (err, result) => {
          if (err) {
            console.log(err)
            rej(err);
            con.end();
          } else if(result.length > 0) {
            
            res(result);
            con.end();
          } else {
            rej({message:`User ${query} does not exist`, x:false});
            con.end();
          
          }
        });
      }
    })

  })

}

module.exports = {
  getUser,
  register,
  test
}
