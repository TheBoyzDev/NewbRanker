const { EmbedBuilder } = require('discord.js');
const { GetRankEmojiName } = require('../ValorantHelpers/helpers');

const ValorantPlayer = require('../../models/ValorantPlayer');

async function AllPlayersLeaderBoardEmbed(guild){

    const players = await ValorantPlayer.find().sort({ val_elo: -1 });

    const leaderboardEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Valorant Leaderboard')
            .setTimestamp();

            players.forEach((player, index) => {
            // Get the corresponding emoji for the player's rank
            const rankEmojiName = GetRankEmojiName(player.val_playerRank);
            const rankEmoji = guild.emojis.cache.find(emoji => emoji.name === rankEmojiName);
            const link = `https://tracker.gg/valorant/profile/riot/${[player.val_name.replace(/\s+/g, '')]}%23${player.val_tag}/overview`;

            // Add the player's info with the rank emoji to the embed in a single line
            leaderboardEmbed.addFields(
                { name: `#${index + 1} ${player.discordName.split('#')[0]}`, 
                value: `ELO: ${player.val_elo} | Rank: ${player.val_playerRank} ${rankEmoji}
                [Tracker](${link})` , inline: false }
            );
        });

    return leaderboardEmbed;
};

module.exports = {
    AllPlayersLeaderBoardEmbed
};
