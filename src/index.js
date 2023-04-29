require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
const schedule = require('node-schedule');

const { handleValStats, updatePlayersInfo } = require('./commands/valstats');
const { handleValRegister } = require('./commands/valregister');
const { handleValLeaderboard } = require('./commands/valleaderboard');
const { parsePlayerNameAndTag, groupPlayersByMatch, getRankEmojiName } = require('./utils/helpers');
const { singlePlayerGameUpdate, oneVsOneGameUpdate ,sameTeamGameUpdate, differentTeamsGameUpdate } = require('./utils/embeds');

const { handleAddWinMeme } = require('./commands/addWinMeme');
const { handleAddLostMeme } = require('./commands/addLostMeme');

//Models
const ValorantPlayer = require('./models/ValorantPlayer')

//Connections
const connectDB = require('./db'); // Import connectDB

// Connect to MongoDB
connectDB();

const leaderboardUpdateSchedule = '0 */4 * * *'; // Run every 4 hours at 0 minutes

// Create a new Discord client
const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
 });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async msg => {
    if (msg.content.startsWith('!valstats')) {
        // Remove !valstats from the message
        msg.content = msg.content.replace('!valstats', '');

        // Extract playerName and playerTag
        const { playerName, playerTag } = parsePlayerNameAndTag(msg.content);

        console.log(playerName);
        console.log(playerTag);

        // Handle the !valstats command
        handleValStats(msg, playerName, playerTag);
    }
    
    //Val Register
    if(msg.content.startsWith('!valregister'))
    {
        msg.content = msg.content.replace('!valregister', '');

        //Validate if the player is already registered
        const discordName = msg.author.tag;
        const existingPlayer = await ValorantPlayer.findOne({ discordName });

        if (existingPlayer) {
            msg.reply('You have already registered a Valorant account. You cannot register multiple accounts.');
            return;
        }

        const { playerName, playerTag } = parsePlayerNameAndTag(msg.content);

        handleValRegister(msg, playerName, playerTag);
    }

    //Val Leaderboard
    if (msg.content.startsWith('!valleaderboard')) {
        const result = await handleValLeaderboard(msg);
        
        // If result is Embed, send it
        if (result && result.embed) {
            msg.channel.send({ embeds: [result.embed] });
        }else{
            msg.reply(result);
        }

    }

    // Message == !cleanchat
    if (msg.content === '!cleanchat') {
        try {
            // Fetch messages in the channel
            const messages = await msg.channel.messages.fetch();
            console.log(`Fetched ${messages.size} messages.`);

            // Bulk delete messages (limited to 100 messages)
            await msg.channel.bulkDelete(messages, true);
            console.log('Messages deleted.');
        } catch (err) {
            console.error(err);
            msg.reply('Error while attempting to clean the chat. Please try again later.');
        }
    }
    
    //Add Win Meme
    if (msg.content.startsWith('!win')) {
        const link = msg.content.replace('!win', '').trim();
        handleAddWinMeme(msg, link);
    }
    //Add Lost Meme
    if (msg.content.startsWith('!lost')) {
        const link = msg.content.replace('!lost', '').trim();
        handleAddLostMeme(msg, link);
    }
});

// Schedule the job to run every minute
schedule.scheduleJob('* * * * *', async () => {
    // Update players info
    updatePlayersInfo();

    let newMatchFound = false;
    const players = await ValorantPlayer.find();
    const { matchGroups, playerStatsArray } = await groupPlayersByMatch(players);

    const channel = client.channels.cache.find((ch) => ch.name === 'rank-status');

    for (const matchID in matchGroups) {
        const group = matchGroups[matchID];
        const lastGame = group.lastGame;
        const teamResults = {};

        for (const player of group.players) {
            if (player.val_lastGameID !== matchID) {
                newMatchFound = true;

                const playerTeam = lastGame.stats.team;
                teamResults[playerTeam] = teamResults[playerTeam] || { players: [], score: lastGame.teams[playerTeam.toLowerCase()] };
                teamResults[playerTeam].players.push(player);

                await ValorantPlayer.findByIdAndUpdate(player._id, { val_lastGameID: matchID });
            }
        }

        const teams = Object.keys(teamResults);
        const messageType = getMessageType(teamResults);

        // Check if there is 1 or 2 teams
        if (teams.length === 1) {
            // Check if the team is winning
            const isWinning = teamResults[teams[0]].score > lastGame.teams[teams[0].toLowerCase() === 'blue' ? 'red' : 'blue'];

            // Check if there is one player or more in the team
            if (teamResults[teams[0]].players.length === 1) {
                const player = teamResults[teams[0]].players[0];

                const gameUpdateEmbed = await singlePlayerGameUpdate(player, playerStatsArray, isWinning);

                // Send the embed message if there's a new match
                if (newMatchFound && gameUpdateEmbed) {
                    await channel.send({ embeds: [gameUpdateEmbed] });
                }
            } else {
                const gameUpdateEmbed = await sameTeamGameUpdate(teamResults[teams[0]].players, playerStatsArray, isWinning);

                // Send the embed message if there's a new match
                if (newMatchFound && gameUpdateEmbed) {
                    await channel.send({ embeds: [gameUpdateEmbed] });
                }
            }
        } else if (teams.length === 2) {
            // Check if oneVsOne or groupDifferentTeams
            if (messageType === 'oneVsOne') {
                // Get winning and loser players
                const winningPlayer = teamResults[teams[0]].score > teamResults[teams[1]].score ? teamResults[teams[0]].players[0] : teamResults[teams[1]].players[0];
                const losingPlayer = teamResults[teams[0]].score < teamResults[teams[1]].score ? teamResults[teams[0]].players[0] : teamResults[teams[1]].players[0];
                
                const gameUpdateEmbed = await oneVsOneGameUpdate(winningPlayer, losingPlayer, playerStatsArray);

                // Send the embed message if there's a new match
                if (newMatchFound && gameUpdateEmbed) {
                    await channel.send({ embeds: [gameUpdateEmbed] });
                }
            } else if (messageType === 'groupDifferentTeams') {
                // Get winning and loser players
                const winningPlayers = teamResults[teams[0]].score > teamResults[teams[1]].score ? teamResults[teams[0]].players : teamResults[teams[1]].players;
                const losingPlayers = teamResults[teams[0]].score < teamResults[teams[1]].score ? teamResults[teams[0]].players : teamResults[teams[1]].players;

                const gameUpdateEmbed = await differentTeamsGameUpdate(winningPlayers, losingPlayers, playerStatsArray);

                // Send the embed message if there's a new match
                if (newMatchFound && gameUpdateEmbed) {
                    await channel.send({ embeds: [gameUpdateEmbed] });
                }
            }
        }   
    }
});



// Schedule the job to run every 4 hours
schedule.scheduleJob(leaderboardUpdateSchedule, async () => {
    try {
        const result = await handleValLeaderboard();

        const channel = client.channels.cache.find(ch => ch.name === 'newb-ranking');
        await channel.send({ embeds: [result] });
        
    } catch (error) {
        console.error(`Error generating the leaderboard: ${error.message}`);
    }
});

function getMessageType(teamResults) {
    const teams = Object.keys(teamResults);
    if (teams.length === 1) {
        if (teamResults[teams[0]].players.length === 1) {
            return 'alone';
        } else {
            return 'groupSameTeam';
        }
    } else if (teamResults[teams[0]] && teamResults[teams[1]]) {
        if (teamResults[teams[0]].players.length === 1 && teamResults[teams[1]].players.length === 1) {
            return 'oneVsOne';
        } else {
            return 'groupDifferentTeams';
        }
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);