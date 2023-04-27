const { EmbedBuilder } = require('discord.js');
const ValorantPlayer = require('../models/ValorantPlayer');

async function handleValLeaderboard(msg) {
    try {
        const players = await ValorantPlayer.find().sort({ val_elo: -1 });

        const topPlayers = players.slice(0, 10);

        const leaderboardEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Valorant Leaderboard')
            .setTimestamp();

        topPlayers.forEach((player, index) => {
            // Get the corresponding emoji for the player's rank
            const rankEmojiName = getRankEmojiName(player.val_playerRank);
            const rankEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === rankEmojiName);

            // Add the player's info with the rank emoji to the embed in a single line
            leaderboardEmbed.addFields(
                { name: `#${index + 1} ${player.discordName.split('#')[0]}`, value: `ELO: ${player.val_elo} | Rank: ${player.val_playerRank} ${rankEmoji}`, inline: false }
            );
        });

        const channel = msg.guild.channels.cache.find(ch => ch.name === 'newb-ranking');

        // Delete all existing leaderboard messages in the channel
        const messages = await channel.messages.fetch();
        const leaderboardMessages = messages.filter(m => m.author.id === channel.client.user.id && m.embeds[0] && m.embeds[0].title === 'Valorant Leaderboard');
        await Promise.all(leaderboardMessages.map(m => m.delete()));


        // Send the new leaderboard message
        if (channel) {
            await channel.send({ embeds: [leaderboardEmbed] });
        } else {
            msg.reply('Cannot find the "newb-ranking" channel. Please create one.');
        }
    } catch (error) {
        console.error(error);
        msg.reply('Error generating the leaderboard. Please try again later.');
    }
}

// Get the corresponding emoji for the player's rank
function getRankEmojiName(playerRank) {
    const rankMapping = {
        'Iron 1': 'rank_iro1',
        'Iron 2': 'rank_iro2',
        'Iron 3': 'rank_iro3',
        'Bronze 1': 'rank_bro1',
        'Bronze 2': 'rank_bro2',
        'Bronze 3': 'rank_bro3',
        'Silver 1': 'rank_sil1',
        'Silver 2': 'rank_sil2',
        'Silver 3': 'rank_sil3',
        'Gold 1': 'rank_gol1',
        'Gold 2': 'rank_gol2',
        'Gold 3': 'rank_gol3',
        'Platinum 1': 'rank_pla1',
        'Platinum 2': 'rank_pla2',
        'Platinum 3': 'rank_pla3',
        'Diamond 1': 'rank_dia1',
        'Diamond 2': 'rank_dia2',
        'Diamond 3': 'rank_dia3',
        'Ascendant 1': 'rank_asc1',
        'Ascendant 2': 'rank_asc2',
        'Ascendant 3': 'rank_asc3',
        'Immortal 1': 'rank_im1',
        'Immortal 2': 'rank_im2',
        'Immortal 3': 'rank_im3',
        'Radiant': 'rank_rad'
    };

    return rankMapping[playerRank] || '';
}

module.exports = {
    handleValLeaderboard
};
