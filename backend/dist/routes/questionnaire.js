"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User"); // Assuming User.js handles MongoDB connection
const router = express_1.default.Router();
// POST /questionnaire
router.post('/', async (req, res) => {
    try {
        const { uid, questionnaire } = req.body;
        if (!uid || !questionnaire) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Store the questionnaire data in MongoDB
        const result = await User_1.db.collection('onboarding').updateOne({ uid }, { $set: { questionnaire } }, { upsert: true });
        res.status(200).json({ message: 'Questionnaire stored successfully', result });
    }
    catch (error) {
        console.error('Error storing questionnaire:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
