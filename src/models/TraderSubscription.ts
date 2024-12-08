import mongoose from 'mongoose';

const traderSubscriptionSchema = new mongoose.Schema({
    traderId: {
        type: String,
        required: true
    },
    traderAddress: {
        type: String,
        required: true,
        lowercase: true
    },
    subscribers: [{
        chatId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        subscribedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const TraderSubscription = mongoose.model('TraderSubscription', traderSubscriptionSchema);
export default TraderSubscription;
