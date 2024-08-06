const sqlite3 = require('sqlite3').verbose();
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        this.#initializePool();
        Database.instance = this;
        console.log("database initialized");
    }
    #dbPool = [];
    #DATABASE_FILE = 'server_database.db';
    #MAX_POOL_SIZE = 100; // Adjust as needed
    #initializePool() {
        for (let i = 0; i < this.#MAX_POOL_SIZE; i++) {
            let db = this.#createConnection();
            if (i === 0) {
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    username TEXT NOT NULL,
                    password TEXT NOT NULL
                )`, (err) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }
                    console.log('Table "users" created or already exists.');
                });
            }
            this.#dbPool.push(db);
        }
    }
    #createConnection() {
        return new sqlite3.Database(this.#DATABASE_FILE, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('Error opening database connection:', err.message);
            } else {
                console.log('Connected to the SQLite database:', this.#DATABASE_FILE);
            }
        });
    }

    /**  
    * @returns {Database}
    */
    async asyncGetConnectionFromPool() {
        return new Promise((resolve) => {
            const dbPool = this.#dbPool;
            if (dbPool.length > 0) {
                const db = dbPool.pop(); // Get a connection from the pool
                console.log('Using a database connection from the pool. Pool size:', dbPool.length);
                resolve(db);
                // return db;
            } else {
                resolve(null);
            }
        });
    }
    getConnectionFromPool(callback) {
        const dbPool = this.#dbPool;
        if (dbPool.length > 0) {
            let db = dbPool.pop(); // Get a connection from the pool
            console.log('Using a database connection from the pool. Pool size:', dbPool.length);
            callback(null, db);
        } else {
            callback(new Error('No database connections available in the pool'));
        }
    }
    releaseConnectionToPool(db) {
        const dbPool = this.#dbPool;
        dbPool.push(db); // Release the connection back to the pool
        console.log('Released database connection back to the pool. Pool size:', dbPool.length);
    }
    closeConnection() {
        this.#dbPool.forEach(dbConnection => {
            dbConnection.close((err) => {
                if (err) {
                    console.error('Error closing database connection:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        });
    }
} 
module.exports = {
    Database
}