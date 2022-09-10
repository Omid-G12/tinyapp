const bcrypt = require('bcryptjs');


const findUser = function(email, database) {
  let keys = Object.keys(database);
  for (let key of keys) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

const findPass = function(input, database) {
  let keys = Object.keys(database);
  for (let key of keys) { 
    if (bcrypt.compareSync(input, database[key].password)) {
      return database[key];
    }
  }
  return null;
};

module.exports = { findUser, findPass };