"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedPrompt = saveGeneratedPrompt;
const User_1 = __importDefault(require("../models/User"));
async function saveGeneratedPrompt(uid, prompt) {
    const user = await User_1.default.findOne({ uid });
    if (!user) {
        throw new Error('User not found');
    }
    user.generatedPrompt = prompt;
    await user.save();
}
