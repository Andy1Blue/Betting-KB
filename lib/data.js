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
    const date = Date.now();
    const con = mysql.createConnection(config.db);
    const key = helpers.createRandomString(30);
    const obj = {
      name: 'test',
      email: 'pk2@pk.pl',
    }
    con.connect(err => {
      if (err) {
        rej(err);
      } else {
        get('user', 'user_email', user.email).then((data) => {
          if (data.message) {
            get('register', 'user_ip', user.ip).then((data) => {
              if (Array.isArray(data) && date - data[0].date < 60000) {
                console.log(date - data[0].date)
                rej({
                  message: `You must wait a moment`
                });
                con.end();
              } else {
                if (Array.isArray(data) && data[0].id) {
                  deleteId('register', data[0].id)
                }
                let password = helpers.hash(user.password)
                console.log(password)
                // add(obj).then(data => console.log(data)).catch((err) =>console.log(err.sqlMessage))
                con.query(`INSERT INTO register (user_name, user_email, user_password, user_ip, user_key, date) VALUES ("${user.name}", "${user.email}", "${password}","${user.ip}", "${key}", ${date})`, err => {
                  if (err) {
                    rej(err);
                    con.end();
                  } else {
                    helpers.sendEmail(user.email, key)
                    res({
                      message: `Verification email was sent to ${user.email}`
                    });
                    con.end();
                  }
                })

              }
            })
          } else {
            rej({
              message: `User ${user.email} already exist`
            });
            con.end();
          }
        })
      }
    })
  })
}

//Delete from db
deleteId = (tab, id) => {
  let con = mysql.createConnection(config.db);
  con.connect(err => {
    if (err) {
      console.log(err)
    } else {
      con.query(`DELETE FROM ${tab} WHERE id = ${id}`, err => {
        if (err) {
          console.log(err)
          con.end();
        } else {
          console.log(`Id ${id} has been deleted`);
          con.end();
        }
      })
    }
  })
}

addVerifiedUser = (key) => {
  return new Promise((res, rej) => {
    get('register', 'user_key', key).then(user => {
      if (Array.isArray(user) && user[0].user_email) {
        console.log(user)
        add(user[0]);
        deleteId('register', user[0].id)
        res({
          message: 'User has been added'
        })
      } else {
        rej({
          message: 'Key does not exist'
        })

      }
    }).catch(err => rej({
      test: 'sssss'
    }))

  })
}
//Add to db
add = (user) => {
  return new Promise((res, rej) => {
    let con = mysql.createConnection(config.db);
    con.connect(err => {
      if (err) {
        rej(err)
        con.end()
      } else {
        con.query(`INSERT INTO user (user_name, user_email, user_password) VALUES ("${user.user_name}", "${user.user_email}","${user.user_password}")`, err => {
          if (err) {
            rej(err)
            con.end()
          } else {
            res(user)
            con.end()
          }
        })
      }
    })
  })
}



//Get user from db
get = (tab, tabField, query) => {


  // console.log(dat)
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
          } else if (result.length > 0) {

            res(result);
            con.end();
          } else {
            res({
              message: `User ${query} does not exist`,
              isExist: false
            });
            con.end();

          }
        });
      }
    })

  })

}

module.exports = {
  get,
  register,
  addVerifiedUser
}