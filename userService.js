const bcrypt = require('bcrypt');
const userRepository = require('./useRepository');

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Boolean>}
 */
async function addUser(username, password) {
  return new Promise(async resolve => {
    //if anything is missing reject
    if (!!!username || !!!password) {
      resolve(false);
      return;
    }
    //if username already exists reject
    const usernameNotAvailable = !! await userRepository.getUserByUsername(username);
    if (usernameNotAvailable) {
      resolve(false);
      return;
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error while hashing password:', err);
        resolve(false);
        return;
      }
      // Store hash in your database
      console.log('Hashed password:', hashedPassword);
      if (!!userRepository.insertUser(username, hashedPassword))
        resolve(true);
    }); 
  }); 
}
/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean}
 */
async function authenticate(username, password) {
  return new Promise((resolve) => {
    userRepository.getUserByUsername(username)
      .then(async user => {
        console.log("authenticate: user search result => " + JSON.stringify(user));
        const userNotFound = !!!user;
        if (userNotFound) {
          resolve(false);
          return;
        }
        await bcrypt.compare(password, user.password)
          .then(match => resolve(match))
          .catch(error => {
            console.error('Error while comparing password:', error)
          });
        resolve(false);
      }
      );
  });
}
module.exports = {
  addUser
  , authenticate
}