const { EmbedBuilder } = require('discord.js');
const Memes = require('../models/Memes');

function valStatsEmbed(playerName, playerTag, playerRank, playerCardURL, rankImageURL) {
    const embed = new EmbedBuilder()
        .setTitle(`${playerName}#${playerTag} Valorant Stats`)
        .addFields([
          { name: 'Current Rank', value: playerRank, inline: true },
        ])
        .setImage(playerCardURL)
        .setThumbnail(rankImageURL);

    return embed;
}

async function sendGameUpdate(player, isWinning) {
    const memesCount = await Memes.countDocuments({ isWinning });

    //generate a random number between 0 and the number of memes in the database
    const randomIndex = Math.floor(Math.random() * memesCount);
    console.log(randomIndex);

    // get a random meme
    const meme = await Memes.findOne({ isWinning }).skip(randomIndex).limit(1);
    console.log(meme.URL);

    const gameUpdateEmbed = new EmbedBuilder()
        .setColor(isWinning ? '#28a745' : '#dc3545')
        .setTitle(`${player.val_name} ${isWinning ? 'Is da best, just WON' : 'Is a noob and just LOST'} his last game!`)
        .setImage(meme.URL)
        .setTimestamp();
        
    return gameUpdateEmbed;
}

module.exports = {
    valStatsEmbed,
    sendGameUpdate
};