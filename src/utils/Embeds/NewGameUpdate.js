const { EmbedBuilder } = require('discord.js');

const { GetRandomMeme, GetAgentImage } = require('../ValorantHelpers/helpers');

const ValorantPlayer = require('../../models/ValorantPlayer');

async function OneVsOneGameUpdate(winningPlayer, losingPlayer, allPlayerStats, isDraw) {
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
        .setColor(isDraw ? '#ffe659' : '#28a745')
        .setTitle(isDraw ? `${winningPlayer.val_name} drew against ${losingPlayer.val_name} in their last game!`
                         : `${winningPlayer.val_name} beat the shit out of ${losingPlayer.val_name} in their last game!`)
        //.addField('Winning team meme', '\u200b')
        .setImage(isDraw ? losingMeme.URL : winningMeme.URL);

    addPlayerStats(embed, winningPlayer, 'Winner');

    //embed.addField('Losing team meme', '\u200b')
    //    .setImage(losingMeme.URL);

    addPlayerStats(embed, losingPlayer, 'Loser');

    embed.setTimestamp();

    return embed;
}

async function SinglePlayerGameUpdate(player, allPlayerStats, isWinning, isDraw) {
    const meme = await GetRandomMeme(isWinning);

    // Find the specific player's stats in the array
    const playerStats = allPlayerStats.find(stats => stats.playerName.trim() === player.val_name.trim());

    if (!playerStats) {
        throw new Error(`Player ${player.val_name} not found in the given player stats.`);
    }

    // Agent Name
    const agentName = playerStats.stats.character.name;
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
        .setColor(isDraw ? '#ffe659' : isWinning ? '#28a745' : '#dc3545')
        .setTitle(`${player.val_name} ${isDraw ? 'just DREW' : isWinning ? 'just WON' : 'just LOST'} their last game!`)
        .setThumbnail(GetAgentImage(agentName))
        .addFields(
            { name: '**Agent**', value: `${playerStats.stats.character.name}`, inline: true },
            { name: '**HS %**', value: `${headshotPercentage} %`, inline: true },
            { name: ' ', value: ' ', inline: true },
            { name: '**(K/D/A)**', value: `${kda}`,inline: true },
            { name: '**Combat Score**', value: `${combatScore}`, inline: true },
            { name: ' ', value: ' ', inline: true },
        )
        .setImage(meme.URL)
        //.setTimestamp();

    return embed;
}

async function SameTeamGameUpdate(players, allPlayerStats, isWinning, isDraw) {
    const meme = await GetRandomMeme(isWinning);

    const titleEmbed = new EmbedBuilder()
        .setTitle(`${players.map(p => p.val_name).join(', ')} ${isDraw ? 'just DREW' : isWinning ? 'just WON' : 'just LOST'} as a Team!`)
        .setColor(isDraw ? '#ffe659' : isWinning ? '#28a745' : '#dc3545');

    const playerEmbeds = players.map(player => {
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

        const embed = new EmbedBuilder()
            .setTitle(`**${player.val_name}**`)
            .setColor(isDraw ? '#ffe659' : isWinning ? '#28a745' : '#dc3545')
            .setThumbnail(GetAgentImage(playerStats.stats.character.name))
            .addFields(
                { name: 'Agent', value: `${playerStats.stats.character.name}`, inline: true },
                { name: '(K/D/A)', value: `${kda}`,inline: true },
                { name: 'Headshot Percentage', value: `${headshotPercentage}%`, inline: true },
                { name: 'Combat Score', value: `${combatScore}`, inline: true }
            )
            .setTimestamp();
        
        return embed;
    });

    const memeEmbed = new EmbedBuilder()
        .setImage(meme.URL)
        .setColor(isDraw ? '#ffe659' : isWinning ? '#28a745' : '#dc3545');

    return [titleEmbed, playerEmbeds, memeEmbed];
}


async function DifferentTeamsGameUpdate(winningPlayers, losingPlayers, allPlayerStats, isDraw) {
    const winningMeme = await GetRandomMeme(true);
    const losingMeme = await GetRandomMeme(false);

    function createPlayerEmbed(player, prefix) {
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

        const embed = new EmbedBuilder()
            .setColor(prefix === 'Draw' ? '#ffe659' : prefix === 'Winner' ? '#dc3545' : '#28a745')
            .setTitle(`**${prefix} ${player.val_name}**`)
            .setThumbnail(GetAgentImageName(playerStats.stats.character.name))
            .addFields(
                { name: 'Agent', value: `${playerStats.stats.character.name}`, inline: true },
                { name: '(K/D/A)', value: `${kda}`, inline: true },
                { name: 'Headshot Percentage', value: `${headshotPercentage}%`, inline: true },
                { name: 'Combat Score', value: `${combatScore}`, inline: true }
            )
            .setTimestamp();

        return embed;
    }

    const titleEmbed = new EmbedBuilder()
        .setColor(isDraw ? '#ffe659' : '#547feb')
        .setTitle(isDraw ? `${winningPlayers.map(p => p.val_name).join(', ')} drew against ${losingPlayers.map(p => p.val_name).join(', ')} in their last game!`
                         : `${winningPlayers.map(p => p.val_name).join(', ')} beat the shit out of ${losingPlayers.map(p => p.val_name).join(', ')} in their last game!`)
        .setImage(isDraw ? losingMeme.URL : winningMeme.URL)
        .setTimestamp(); 

        const playerEmbeds = [];
        for (const player of winningPlayers.concat(losingPlayers)) {
            let prefix = '';
            if (isDraw) {
                prefix = 'Draw';
            } else {
                prefix = winningPlayers.some(winner => winner.val_name.trim() === player.val_name.trim()) ? 'Winner' : 'Loser';
            }
            playerEmbeds.push(createPlayerEmbed(player, prefix));
        }

    return [titleEmbed, playerEmbeds];
}

module.exports = {
    OneVsOneGameUpdate,
    SinglePlayerGameUpdate,
    SameTeamGameUpdate,
    DifferentTeamsGameUpdate,
};



module.exports = {
    OneVsOneGameUpdate,
    SinglePlayerGameUpdate,
    SameTeamGameUpdate,
    DifferentTeamsGameUpdate,
};