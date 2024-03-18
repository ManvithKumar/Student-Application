// userController.js

const { executeDB } = require('../data/db');

// Function to get all users
const getAllUsers = async () => {
    return new Promise((resolve, reject) => {
        const db = executeDB();
        db.all('SELECT * FROM USERS ', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to get a single user by ID
const getUserById = async (userId) => {
    return new Promise((resolve, reject) => {
        const db = executeDB();
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Function to create a new user
const createUser = async (userData) => {
    // Assuming userData contains necessary fields like name, email, etc.
    return new Promise((resolve, reject) => {
        const db = executeDB();
        db.run('INSERT INTO users (name, email) VALUES (?, ?)', [userData.name, userData.email], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, ...userData });
            }
        });
    });
};

// Function to update a user
const updateUser = async (userId, userData) => {
    // Assuming userData contains fields to update like name, email, etc.
    return new Promise((resolve, reject) => {
        const db = executeDB();
        db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [userData.name, userData.email, userId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: userId, ...userData });
            }
        });
    });
};

// Function to delete a user
const deleteUser = async (userId) => {
    return new Promise((resolve, reject) => {
        const db = executeDB();
        db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: userId });
            }
        });
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
