// src/controllers/userController.js
const { db, auth } = require('../config/firebase');

// Register a new user
exports.register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({ email, password, displayName: name });
        // Save profile in Firestore
        await db.collection('users').doc(userRecord.uid).set({ email, name, preferences: {} });
        res.status(201).json({ message: 'User registered successfully', uid: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
        res.json(userDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const updates = req.body;
        // Optionally: You may want to limit fields that can be updated
        await db.collection('users').doc(userId).update(updates);
        const userDoc = await db.collection('users').doc(userId).get();
        res.json(userDoc.data());
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
