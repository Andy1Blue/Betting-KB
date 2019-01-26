/*
 *
 * Library for collecting and editing data from database
 *
 */

//Dependencies
const mysql = require('mysql');
const config = require('../config');

//Container for the module (to be exported)
const lib = {};

//Create new record
lib.create = (table, data) => {
  return new Promise((res, rej) => {
    const con = mysql.createConnection(config.db);
    con.query(`INSERT INTO ${table} SET ?`, data, (err, result, fields) => {
      if (!err && result) {
        res(result)
      } else {
        // console.log(err)
        rej({
          'Error': 'Could not create a new record'
        });
      }
    });
    con.end();
  });
};

//Read from DB
lib.read = (table, field, value) => {
  return new Promise((res, rej) => {
    const con = mysql.createConnection(config.db);
    if (field && value) {
      con.query(`Select * from ${table} WHERE ${field} = ?`, [value], (err, result, fields) => {
        if (!err && result && result.length > 0) {
          console.log(result);
          res(result);
        } else {
          rej({
            'Error': 'Could not find the specified record'
          });
        }
      });
    } else {
      con.query(`Select * from ${table}`, (err, result, fields) => {
        if (!err && result && result.length > 0) {
          res(result);
        } else {
          rej({
            'Error': 'Could not find the specified records'
          });
        }
      });
    }
    con.end();
  });
};

//Delete from DB
lib.delete = (table, field, value) => {
  return new Promise((res, rej) => {
    const con = mysql.createConnection(config.db);
    con.query(`Delete from ${table} WHERE ${field} = ?`, [value], (err, result, fields) => {
      if (!err && result) {
        res(result);
      } else {
        rej({
          'Error': 'Could not delete the specified record'
        });
      }
    });
    con.end();
  });
};

//Update from DB
lib.update = (table, id, value) => {
  return new Promise((res, rej) => {
    const con = mysql.createConnection(config.db);
    con.query(`UPDATE ${table} SET ? WHERE id = ${id}`, [value], (err, result, fields) => {
      if (!err && result) {
        res(result);
      } else {
        rej({
          'Error': 'Could not update'
        });
      }
    });
    con.end();
  });
};

//Update from DB - testing universal function
lib.update = (table, value) => {
  return new Promise((res, rej) => {
    const con = mysql.createConnection(config.db);
    con.query(`UPDATE ${table} SET ?`, [value], (err, result, fields) => {
      if (!err && result) {
        res(result);
      } else {
        rej({
          'Error': 'Could not update'
        });
      }
    });
    con.end();
  });
};

//Export module
module.exports = lib
