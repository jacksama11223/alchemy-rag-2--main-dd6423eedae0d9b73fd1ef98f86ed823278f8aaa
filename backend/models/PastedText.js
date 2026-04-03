const mongoose = require('mongoose');

const pastedTextSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'manual'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PastedText', pastedTextSchema);
