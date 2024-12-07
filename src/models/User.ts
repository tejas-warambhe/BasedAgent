import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    walletAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
