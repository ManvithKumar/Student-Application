// userRoutes.js

const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controller/usercontroller');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await getUserById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(user);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new user
router.post('/users', async (req, res) => {
    const userData = req.body;
    try {
        const newUser = await createUser(userData);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a user
router.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    try {
        const updatedUser = await updateUser(userId, userData);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await deleteUser(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
