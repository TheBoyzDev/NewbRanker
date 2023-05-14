const mongoose = require('mongoose');

const valorantPlayerSchema = new mongoose.Schema({
    discordName: String,
    riotAccessToken: String,
    riotRefreshToken: String,
    expireAt: Date,
    linkGeneratedUUID: String,
    val_name: String,
    val_tag: String,
    val_puuid: String,
    val_region: String,
    val_playerCardURL: String,
    val_playerRank: String,
    val_rankImageURL: String,
    val_lastGameID: String,
    val_elo: Number,
    code: String,
    state: String,
    type: String,
});

// Create a model
const ValorantPlayer = mongoose.model('ValorantPlayer', valorantPlayerSchema);

module.exports = ValorantPlayer;