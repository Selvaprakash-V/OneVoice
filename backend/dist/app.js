"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const onboarding_1 = __importDefault(require("./routes/onboarding"));
const user_1 = __importDefault(require("./routes/user"));
const questionnaire_1 = __importDefault(require("./routes/questionnaire"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const mongoUri = process.env.MONGODB_URI;
mongoose_1.default.connect(mongoUri || '')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use('/onboarding', onboarding_1.default);
app.use('/users', user_1.default);
app.use('/questionnaire', questionnaire_1.default);
app.get('/', (req, res) => {
    res.send('OneVoice API running');
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
