"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userService_1 = require("../services/userService");
const signRecognitionService_1 = require("../services/signRecognitionService");
const router = express_1.default.Router();
// Mock ChatController for backend usage
const ChatController = {
    processInput: async ({ uid, mode, text, activeContext, prefs }) => {
        return {
            response: `Processed input for user ${uid} in mode ${mode} with text: ${text}`,
        };
    },
};
// Save generated prompt
router.post('/:uid/generatedPrompt', async (req, res) => {
    const uid = req.params.uid; // Ensure uid is a string
    const prompt = req.body.prompt; // Ensure prompt is a string
    try {
        await (0, userService_1.saveGeneratedPrompt)(uid, prompt);
        res.status(200).send({ message: 'Prompt saved successfully' });
    }
    catch (error) {
        console.error('Error saving generated prompt:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Process sign input
router.post('/process-sign', async (req, res) => {
    var _a;
    const { signFrames } = req.body;
    if (!signFrames) {
        return res.status(400).json({ error: 'Sign frames are required' });
    }
    try {
        const recognizedText = await signRecognitionService_1.SignRecognitionService.recognizeSign(signFrames);
        const chatResponse = await ChatController.processInput({
            uid: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'unknown', // Fallback for missing user ID
            mode: 'sign',
            text: recognizedText,
            activeContext: req.body.activeContext,
            prefs: req.body.prefs,
        });
        res.json(chatResponse);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process sign input' });
    }
});
exports.default = router;
