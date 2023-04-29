const { EmbedBuilder } = require('discord.js');
const { getRandomMeme, getRankEmojiName } = require('./helpers');

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

async function singlePlayerGameUpdate(player, allPlayerStats, isWinning) {
    const meme = await getRandomMeme(isWinning);
    // const selectionStatus = getPlayerSelectionStatus(player); // No need for this line

    // Find the specific player's stats in the array
    const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim()); // Added trim()

    if (!playerStats) {
        throw new Error(`Player ${player.val_name} not found in the given player stats.`);
    }

    // Calculate KDA
    const kda = `(K/D/A) - ${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
    const combatScore = `Combat Score - ${playerStats.stats.score}`;

    // Use playerStats.stats to access the player's statistics
    const embed = new EmbedBuilder()
        .setColor(isWinning ? '#28a745' : '#dc3545')
        .setTitle(`${player.val_name} ${isWinning ? 'just WON' : 'just LOST'} their last game!`)
        .addFields(
            { name: kda, value: ' ',inline: true },
            { name: combatScore, value: ' ', inline: true }
        )
        .setImage(meme.URL)
        .setTimestamp();

    return embed;
}

async function sameTeamGameUpdate(players, allPlayerStats, isWinning) {
    const meme = await getRandomMeme(isWinning);

    const embed = new EmbedBuilder()
        .setColor(isWinning ? '#28a745' : '#dc3545')
        .setTitle(`${players.map(p => p.val_name).join(', ')} ${isWinning ? 'just WON' : 'just LOST'} their last game as a team!`)
        .setImage(meme.URL);

    players.forEach(player => {
        const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

        const kda = `(K/D/A) - ${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
        const combatScore = `Combat Score - ${playerStats.stats.score}`;

        embed.addFields(
            { name: `**${player.val_name}**`, value: ' ', inline: false },
            { name: kda, value: ' ', inline: true },
            { name: combatScore, value: '\u200b', inline: true }
        );
    });

    embed.setTimestamp();

    return embed;
}

async function differentTeamsGameUpdate(winningPlayers, losingPlayers, allPlayerStats) {
    const winningMeme = await getRandomMeme(true);
    const losingMeme = await getRandomMeme(false);

    function addPlayerStats(embed, players, prefix) {
        players.forEach(player => {
            const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

            const kda = `(K/D/A) - ${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
            const combatScore = `Combat Score - ${playerStats.stats.score}`; 

            embed.addFields(
                { name: `**${prefix} ${player.val_name}**`, value: '\u200b', inline: false },
                { name: `Kills -> ${playerStats.stats.kills}`, value: '', inline: true },
                { name: `Deaths -> ${playerStats.stats.deaths}`, value: '', inline: true },
                { name: `Assists -> ${playerStats.stats.assists}`, value: '', inline: true },
                { name: `KDA -> ${kda}`, value: '', inline: true },
                { name: `Combat Score -> ${playerStats.stats.score}`, value: '', inline: true }
            );
        });
    }

    const embed = new EmbedBuilder()
        .setColor('#28a745')
        .setTitle(`${winningPlayers.map(p => p.val_name).join(', ')} beat ${losingPlayers.map(p => p.val_name).join(', ')} in their last game!`)
        .addField('Winning team meme', '\u200b')
        .setImage(winningMeme.URL);

    addPlayerStats(embed, winningPlayers, 'Winner');

    embed.addField('Losing team meme', '\u200b')
         .setImage(losingMeme.URL);

    addPlayerStats(embed, losingPlayers, 'Loser');

    embed.setTimestamp();

    return embed;
}

async function oneVsOneGameUpdate(winningPlayer, losingPlayer, allPlayerStats) {
    const winningMeme = await getRandomMeme(true);
    const losingMeme = await getRandomMeme(false);

    function addPlayerStats(embed, player, prefix) {
        const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

        const kda = (playerStats.stats.kills + playerStats.stats.assists) / playerStats.stats.deaths;

        embed.addFields(
            { name: `**${prefix} ${player.val_name}**`, value: '\u200b', inline: false },
            { name: `Kills -> ${playerStats.stats.kills}`, value: '', inline: true },
            { name: `Deaths -> ${playerStats.stats.deaths}`, value: '', inline: true },
            { name: `Assists -> ${playerStats.stats.assists}`, value: '', inline: true },
            { name: `KDA -> ${kda}`, value: '', inline: true },
            { name: `Combat Score -> ${playerStats.stats.score}`, value: '', inline: true }
        );
    }

    const embed = new EmbedBuilder()
        .setColor('#28a745')
        .setTitle(`${winningPlayer.val_name} beat ${losingPlayer.val_name} in their last game!`)
        .addField('Winning team meme', '\u200b')
        .setImage(winningMeme.URL);

    addPlayerStats(embed, winningPlayer, 'Winner');

    embed.addField('Losing team meme', '\u200b')
         .setImage(losingMeme.URL);

    addPlayerStats(embed, losingPlayer, 'Loser');

    embed.setTimestamp();

    return embed;
}



module.exports = {
    valStatsEmbed,
    singlePlayerGameUpdate,
    sameTeamGameUpdate,
    differentTeamsGameUpdate,
    oneVsOneGameUpdate
};
