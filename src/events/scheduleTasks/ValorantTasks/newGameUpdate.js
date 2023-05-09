const cron = require('node-cron');
const ValorantPlayer = require('../../../models/ValorantPlayer');
const { GroupPlayersByMatch } = require('../../../utils/ValorantHelpers/helpers');

const { OneVsOneGameUpdate, SinglePlayerGameUpdate, DifferentTeamsGameUpdate, SameTeamGameUpdate } = require('../../../utils/Embeds/NewGameUpdate');
const { FetchMatchData } = require('../../../utils/api');

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
                let isDraw = false;

                const matchData = await FetchMatchData(matchID);
                let isWinning = false;

                for (const player of group.players) {
                    if (player.val_lastGameID !== matchID) {
                        newMatchFound = true;
                    
                        const playerTeam = lastGame.stats.team;
                        teamResults[playerTeam] = teamResults[playerTeam] || { players: [], score: lastGame.teams[playerTeam.toLowerCase()] };
                        teamResults[playerTeam].players.push(player);
                    
                        await ValorantPlayer.findByIdAndUpdate(player._id, { val_lastGameID: matchID });
                    }
                }
                
                const allTeams = Object.keys(teamResults);
                const messageType = getMessageType(teamResults);

                // Check if there is 1 or 2 Teams
                if (allTeams.length === 1) {

                    // Check if it's a Draw
                    if (matchData.data.teams.red.has_won === false && matchData.data.teams.blue.has_won === false) {
                        isWinning = false;
                        isDraw  = true;                        
                    }else{
                        isWinning = matchData.data.teams[allTeams[0].toLowerCase()].has_won === true ? true : false;
                    }
                    
                    // Check if there is one player or more in the team
                    if (teamResults[allTeams[0]].players.length === 1) {
                        const player = teamResults[allTeams[0]].players[0];

                        const gameUpdateEmbed = await SinglePlayerGameUpdate(player, playerStatsArray, isWinning, isDraw);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            await channel.send({ embeds: [gameUpdateEmbed] });
                        }
                    } else {
                        const gameUpdateEmbed = await SameTeamGameUpdate(teamResults[allTeams[0]].players, playerStatsArray, isWinning, isDraw);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            for(const embed of gameUpdateEmbed)
                            {
                                await channel.send({ embeds: [embed] });
                            }
                        }
                    }
                } else if (allTeams.length === 2) {

                    // Check if it's a Draw
                    if (matchData.data.allTeams.red.has_won === false && matchData.data.allTeams.blue.has_won === false) {
                        isDraw  = true;
                    }

                    // Check if oneVsOne or groupDifferent Teams
                    if (messageType === 'oneVsOne') {
                        // Get winning and loser players
                        const winningPlayer = isDraw ? teamResults[allTeams[0]].players[0] : teamResults[allTeams[0]].score > teamResults[allTeams[1]].score ? teamResults[allTeams[0]].players[0] : teamResults[allTeams[1]].players[0];
                        const losingPlayer = isDraw ? teamResults[allTeams[1]].players[0] : teamResults[allTeams[0]].score < teamResults[allTeams[1]].score ? teamResults[allTeams[0]].players[0] : teamResults[allTeams[1]].players[0];

                        const gameUpdateEmbed = await OneVsOneGameUpdate(winningPlayer, losingPlayer, playerStatsArray, isDraw);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            await channel.send({ embeds: [gameUpdateEmbed] });
                        }
                    } else if (messageType === 'groupDifferentTeams') {
                        // Get winning and loser players
                        const winningPlayers = isDraw ? teamResults[allTeams[0]].players : teamResults[allTeams[0]].score > teamResults[allTeams[1]].score ? teamResults[allTeams[0]].players : teamResults[allTeams[1]].players;
                        const losingPlayers = isDraw ? teamResults[allTeams[1]].players : teamResults[allTeams[0]].score < teamResults[allTeams[1]].score ? teamResults[allTeams[0]].players : teamResults[allTeams[1]].players;

                        const gameUpdateEmbed = await DifferentTeamsGameUpdate(winningPlayers, losingPlayers, playerStatsArray, isDraw);

                        // Send the embed message if there's a new match
                        if (newMatchFound && gameUpdateEmbed) {
                            await channel.send({ embeds: [gameUpdateEmbed] });
                        }
                    }
                }

            }

        } catch(err){console.log(err);}
                
            
        function getMessageType(teamResults) {
            const allTeams = Object.keys(teamResults);
            if (allTeams.length === 1) {
                if (teamResults[allTeams[0]].players.length === 1) {
                    return 'alone';
                } else {
                    return 'groupSameTeam';
                }
            } else if (teamResults[allTeams[0]] && teamResults[allTeams[1]]) {
                if (teamResults[allTeams[0]].players.length === 1 && teamResults[allTeams[1]].players.length === 1) {
                    return 'oneVsOne';
                } else {
                    return 'groupDifferentTeams';
                }
            }
        }

    });
}