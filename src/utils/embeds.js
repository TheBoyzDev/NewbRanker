const { EmbedBuilder } = require('discord.js');

function ValStatsEmbed(playerName, playerTag, playerRank, playerCardURL, rankImageURL) {
    const embed = new EmbedBuilder()
        .setTitle(`${playerName}#${playerTag} Valorant Stats`)
        .addFields([
          { name: 'Current Rank', value: playerRank, inline: true },
        ])
        .setImage(playerCardURL)
        .setThumbnail(rankImageURL);

    return embed;
}





module.exports = {
    ValStatsEmbed
};
