require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');

const eventHandler = require('./handlers/eventHandler');

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





client.on('ready', async () => {
    
    console.log(`Logged in as ${client.user.tag}!`);

});

eventHandler(client);

client.login(process.env.DISCORD_BOT_TOKEN);


/*
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

*/

