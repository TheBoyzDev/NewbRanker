const { EmbedBuilder } = require('discord.js');

const { GetRandomMeme } = require('../ValorantHelpers/helpers');

const ValorantPlayer = require('../../models/ValorantPlayer');

async function OneVsOneGameUpdate(winningPlayer, losingPlayer, allPlayerStats) {
    const winningMeme = await getRandomMeme(true);
    const losingMeme = await getRandomMeme(false);

    function addPlayerStats(embed, player, prefix) {
        const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

        // Calculate KDA
        const kda = `${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
        const combatScore = `${playerStats.stats.score}`;
        // Shots
        const bodyShots = playerStats.stats.shots.body;
        const headShots = playerStats.stats.shots.head;
        const legShots = playerStats.stats.shots.leg;
        // Calculate Headshot Percentage
        const headshotPercentage = ((headShots / (bodyShots + headShots + legShots)) * 100).toFixed(2);

        embed.addFields(
            { name: `**${prefix} ${player.val_name}**`, value: '\u200b', inline: false },
            { name: 'Agent', value: `${playerStats.stats.character.name}`, inline: true },
            { name: '\u200b', value: '\u200b', inline: false},
            { name: '(K/D/A)', value: `${kda}`,inline: true },
            { name: 'Headshot Percentage', value: `${headshotPercentage}%`, inline: true },
            { name: 'Combat Score', value: `${combatScore}`, inline: true }
        );
    }

    const embed = new EmbedBuilder()
        .setColor('#28a745')
        .setTitle(`${winningPlayer.val_name} beat the shit out of ${losingPlayer.val_name} in their last game!`)
        .addField('Winning team meme', '\u200b')
        .setImage(winningMeme.URL);

    addPlayerStats(embed, winningPlayer, 'Winner');

    embed.addField('Losing team meme', '\u200b')
         .setImage(losingMeme.URL);

    addPlayerStats(embed, losingPlayer, 'Loser');

    embed.setTimestamp();

    return embed;
}

async function SinglePlayerGameUpdate(player, allPlayerStats, isWinning) {
    const meme = await GetRandomMeme(isWinning);

    // Find the specific player's stats in the array
    const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

    if (!playerStats) {
        throw new Error(`Player ${player.val_name} not found in the given player stats.`);
    }

    // Calculate KDA
    const kda = `${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
    const combatScore = `${playerStats.stats.score}`;
    // Shots
    const bodyShots = playerStats.stats.shots.body;
    const headShots = playerStats.stats.shots.head;
    const legShots = playerStats.stats.shots.leg;
    // Calculate Headshot Percentage
    const headshotPercentage = ((headShots / (bodyShots + headShots + legShots)) * 100).toFixed(2);

    // Use playerStats.stats to access the player's statistics
    const embed = new EmbedBuilder()
        .setColor(isWinning ? '#28a745' : '#dc3545')
        .setTitle(`${player.val_name} ${isWinning ? 'just WON' : 'just LOST'} their last game!`)
        .addFields(
            { name: 'Agent', value: `${playerStats.stats.character.name}`, inline: true },
            { name: '\u200b', value: '\u200b', inline: false},
            { name: '(K/D/A)', value: `${kda}`,inline: true },
            { name: 'Headshot Percentage', value: `${headshotPercentage}%`, inline: true },
            { name: 'Combat Score', value: `${combatScore}`, inline: true }
        )
        .setImage(meme.URL)
        .setTimestamp();

    return embed;
}

async function SameTeamGameUpdate(players, allPlayerStats, isWinning) {
    const meme = await GetRandomMeme(isWinning);

    const embed = new EmbedBuilder()
        .setColor(isWinning ? '#28a745' : '#dc3545')
        .setTitle(`${players.map(p => p.val_name).join(', ')} ${isWinning ? 'just WON' : 'just LOST'} their last game as a team!`)
        .setImage(meme.URL);

    players.forEach(player => {
        const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

        // Calculate KDA
        const kda = `${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
        const combatScore = `${playerStats.stats.score}`;
        // Shots
        const bodyShots = playerStats.stats.shots.body;
        const headShots = playerStats.stats.shots.head;
        const legShots = playerStats.stats.shots.leg;
        // Calculate Headshot Percentage
        const headshotPercentage = ((headShots / (bodyShots + headShots + legShots)) * 100).toFixed(2);

        embed.addFields(
            { name: `**${player.val_name}**`, value: ' ', inline: false },
            { name: 'Agent', value: `${playerStats.stats.character.name}`, inline: true },
            { name: '\u200b', value: '\u200b', inline: false},
            { name: '(K/D/A)', value: `${kda}`,inline: true },
            { name: 'Headshot Percentage', value: `${headshotPercentage}%`, inline: true },
            { name: 'Combat Score', value: `${combatScore}`, inline: true }
        );
    });

    embed.setTimestamp();

    return embed;
}

async function DifferentTeamsGameUpdate(winningPlayers, losingPlayers, allPlayerStats) {
    const winningMeme = await GetRandomMeme(true);
    const losingMeme = await GetRandomMeme(false);

    function addPlayerStats(embed, players, prefix) {
        players.forEach(player => {
            const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

            // Calculate KDA
            const kda = `${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}`;
            const combatScore = `${playerStats.stats.score}`;
            // Shots
            const bodyShots = playerStats.stats.shots.body;
            const headShots = playerStats.stats.shots.head;
            const legShots = playerStats.stats.shots.leg;
            // Calculate Headshot Percentage
            const headshotPercentage = ((headShots / (bodyShots + headShots + legShots)) * 100).toFixed(2);

            embed.addFields(
                { name: `**${prefix} ${player.val_name}**`, value: '\u200b', inline: false },
                { name: 'Agent', value: `${playerStats.stats.character.name}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: false},
                { name: '(K/D/A)', value: `${kda}`,inline: true },
                { name: 'Headshot Percentage', value: `${headshotPercentage}%`, inline: true },
                { name: 'Combat Score', value: `${combatScore}`, inline: true }
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


module.exports = {
    OneVsOneGameUpdate,
    SinglePlayerGameUpdate,
    SameTeamGameUpdate,
    DifferentTeamsGameUpdate,
};