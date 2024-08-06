const { Database } = require("./database");
/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
async function insertUser(username, password) {
    return new Promise((resolve) => {
        const database = new Database();
        database.getConnectionFromPool((error, db) => {
            if (username.length > 50) {
                console.error('Username cannot be longer than 50 characters');
                resolve(false);
                return;
            }
            db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
                database.releaseConnectionToPool(db);
                if (err) {
                    console.error(err.message);
                    resolve(false);
                    return;
                }
                resolve(true);
                console.log('A new user has been added');
            });
            
        });
    });
} 
/**
 * 
 * @param {string} username 
 * @returns {Promise<JSON>} jsonUser
 */
async function getUserByUsername(username) {
    return new Promise((resolve) => {
        const database = new Database();
        database.asyncGetConnectionFromPool()
            //the extra promise is just for the sake of it, remove before git push
            .then(db => {
                return new Promise((resolve, reject) => {
                    const sql = 'SELECT * FROM users WHERE username = ?';
                    const params = [username];
                    db.get(sql, params, (err, user) => {
                        database.releaseConnectionToPool(db);
                        if (err) {
                            console.error(err.message);
                            resolve(null); 
                            return;
                        }
                        if (!!!user) {
                            resolve(null); 
                            return;
                        }
                        // console.log("user found in db: " + user);
                        resolve(user) 
                    }); 
                }); 
            })
            .then(user => {
                console.log("User found in then: " + JSON.stringify(user, null, 2));
                resolve(user);
            });
    }
    );
}
module.exports = {
    insertUser
    , getUserByUsername
};

