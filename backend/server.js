require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow server to accept JSON data

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// --- Define the Data Structure (Schema) ---
const dataSchema = new mongoose.Schema({
    date: { type: String, required: true },
    tasks: { type: Array, required: true },
    notes: { type: String },
    userId: { type: String, required: true } // We'll use this to separate data
});

const Data = mongoose.model('Data', dataSchema);

// --- API Routes ---

// Get data for a specific user and date
app.get('/api/data/:userId/:date', async (req, res) => {
    try {
        const data = await Data.findOne({ userId: req.params.userId, date: req.params.date });
        if (!data) {
            return res.json({ tasks: [], notes: '' }); // Send empty if nothing is found
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save or update data
app.post('/api/data', async (req, res) => {
    const { userId, date, tasks, notes } = req.body;

    try {
        // Find data for this user/date and update it, or create it if it doesn't exist
        const updatedData = await Data.findOneAndUpdate(
            { userId, date },
            { tasks, notes },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(updatedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Start the Server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));