const { Client, IntentsBitField ,EmbedBuilder } = require('discord.js');
const ValorantPlayer = require('../models/ValorantPlayer');

const { getRankEmojiName } = require('../utils/helpers');

// Create a new Discord client
const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
 });

client.login(process.env.DISCORD_BOT_TOKEN);

async function handleValLeaderboard(msg) {
    let guild, channel;

    try {
        if (msg) {
            // If msg argument is provided, use it to fetch the guild and channel
            guild = msg.guild;
            channel = guild.channels.cache.find(ch => ch.name === 'newb-ranking');
        } else {
            // If msg argument is not provided, fetch the guild and channel using the client object
            guild = client.guilds.cache.first();
            channel = guild.channels.cache.find(ch => ch.name === 'newb-ranking');
        }

        if (!channel) {
            throw new Error('Cannot find the "newb-ranking" channel. Please create one.');
        }

        const players = await ValorantPlayer.find().sort({ val_elo: -1 });
        const topPlayers = players.slice(0, 10);

        const leaderboardEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Valorant Leaderboard')
            .setTimestamp();

        topPlayers.forEach((player, index) => {
            // Get the corresponding emoji for the player's rank
            const rankEmojiName = getRankEmojiName(player.val_playerRank);
            const rankEmoji = guild.emojis.cache.find(emoji => emoji.name === rankEmojiName);

            // Add the player's info with the rank emoji to the embed in a single line
            leaderboardEmbed.addFields(
                { name: `#${index + 1} ${player.discordName.split('#')[0]}`, value: `ELO: ${player.val_elo} | Rank: ${player.val_playerRank} ${rankEmoji}`, inline: false }
            );
        });

        // Delete all existing leaderboard messages in the channel
        const messages = await channel.messages.fetch();

        if(messages.size > 0)
        { 
        const leaderboardMessages = messages.filter(m => m.author.id === channel.client.user.id && m.embeds[0] && m.embeds[0].title === 'Valorant Leaderboard');
        await Promise.all(leaderboardMessages.map(async m => {
            try {
                await m.delete();
            } catch (error) {
                console.error(`Error deleting message ${m.id}: ${error.message}`);
            }
        }));

        // Send the new leaderboard message
        return leaderboardEmbed;
        } 

        return leaderboardEmbed;

    } catch (error) {
        console.error(error);
        if (msg) {
            return 'Error generating the leaderboard. Please try again later.';
        }
    }
}

module.exports = {
    handleValLeaderboard
};
