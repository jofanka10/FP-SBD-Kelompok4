const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    oldData: {
        type: Object,
        required: false
    },
    newData: {
        type: Object,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
