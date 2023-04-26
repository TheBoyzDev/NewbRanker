const mongoose = require('mongoose');

const memesSchema = new mongoose.Schema({
    isLosing: Boolean,
    isWinning: Boolean,
    URL: String,
});

// Create a model
const Memes = mongoose.model('Memes', memesSchema);

module.exports = Memes;