const cron = require('node-cron');
const ValorantPlayer = require('../../../models/ValorantPlayer');
const { GroupPlayersByMatch } = require('../../../utils/ValorantHelpers/helpers');

const { OneVsOneGameUpdate, SinglePlayerGameUpdate, DifferentTeamsGameUpdate, SameTeamGameUpdate } = require('../../../utils/Embeds/NewGameUpdate');

module.exports = async (client) => {
    cron.schedule('* * * * *', async () => {
        try
        {
            let newMatchFound = false;

            const players = await ValorantPlayer.find();
            const channel = client.channels.cache.find((ch) => ch.name === 'rank-status');
            
            const { matchGroups, playerStatsArray } = await GroupPlayersByMatch(players);
            
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


                    // Find the winning team
                    const winningTeam = lastGame.teams.blue > lastGame.teams.red ? 'blue' : 'red';
                    // Check if the team in question is the winning team
                    const isWinning = teams[0].toLowerCase() === winningTeam;

                    // Check if there is one player or more in the team
                    if (teamResults[teams[0]].players.length === 1) {
                        const player = teamResults[teams[0]].players[0];

                        const gameUpdateEmbed = await SinglePlayerGameUpdate(player, playerStatsArray, isWinning);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            await channel.send({ embeds: [gameUpdateEmbed] });
                        }
                    } else {
                        const gameUpdateEmbed = await SameTeamGameUpdate(teamResults[teams[0]].players, playerStatsArray, isWinning);

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

                        const gameUpdateEmbed = await OneVsOneGameUpdate(winningPlayer, losingPlayer, playerStatsArray);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            await channel.send({ embeds: [gameUpdateEmbed] });
                        }
                    } else if (messageType === 'groupDifferentTeams') {
                        // Get winning and loser players
                        const winningPlayers = teamResults[teams[0]].score > teamResults[teams[1]].score ? teamResults[teams[0]].players : teamResults[teams[1]].players;
                        const losingPlayers = teamResults[teams[0]].score < teamResults[teams[1]].score ? teamResults[teams[0]].players : teamResults[teams[1]].players;

                        const gameUpdateEmbed = await DifferentTeamsGameUpdate(winningPlayers, losingPlayers, playerStatsArray);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            await channel.send({ embeds: [gameUpdateEmbed] });
                        }
                    }
                }

            }

        } catch(err){console.log(err);}
                
            
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

    });
}