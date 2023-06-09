const { EmbedBuilder } = require('discord.js');
const { GetRankEmojiName } = require('../ValorantHelpers/helpers');

const ValorantPlayer = require('../../models/ValorantPlayer');

async function AllPlayersLeaderBoardEmbed(guild){

    let playersArray = [];
    const players = await ValorantPlayer.find().sort({ val_elo: -1 });

    const leaderboardEmbed = new EmbedBuilder()
            //.setType('rich')
            .setTitle('**Valorant Leaderboard**')
            .setColor('#0099ff')
            .setThumbnail('https://i.imgflip.com/708n2y.gif')
            .setFooter({ 
                text: 'Made with love by Papi Neurotic and 5% Muffin', 
                iconURL: 'https://www.icegif.com/wp-content/uploads/heart-icegif-38.gif' 
            });

            players.forEach((player, index) => {
            // Get the corresponding emoji for the player's rank
            const rankEmojiName = GetRankEmojiName(player.val_playerRank);
            const rankEmoji = guild.emojis.cache.find(emoji => emoji.name === rankEmojiName);
            const link = `https://tracker.gg/valorant/profile/riot/${[player.val_name.replace(/\s+/g, '')]}%23${player.val_tag}/overview`;

            playersArray.push(`\n\**\`\`#${index + 1}\`\`\** [${player.discordName.split('#')[0]}](${link})\n**ELO:** ${player.val_elo} | **Rank:** ${player.val_playerRank} ${rankEmoji}\n`);
            });

            // Add the player's info with the rank emoji to the embed in a single line
            let resultArray = playersArray.join(' ');
            leaderboardEmbed.setDescription(resultArray);

    return leaderboardEmbed;
};

module.exports = {
    AllPlayersLeaderBoardEmbed
};
