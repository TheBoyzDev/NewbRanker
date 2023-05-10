const { GetLastGameInfo } = require('../api');
const Memes = require('../../models/Memes');

function ParsePlayerNameAndTag(messageContent) {
    const args = messageContent.split("#");
    const playerName = args[0];
    const playerTag = args[1];

    return { playerName, playerTag };
}

async function GroupPlayersByMatch(players) {
    const matchGroups = {};
    const playerStatsArray = [];

    for (const player of players) {
        const lastGameInfo = await GetLastGameInfo(player.val_puuid);

        if (lastGameInfo.status === 'error') {
            console.error(lastGameInfo.message);
            continue;
        }

        const lastGame = lastGameInfo.data.data[0];
        const matchID = lastGame.meta.id;
        const stats = lastGame.stats;

        playerStatsArray.push({
            playerName: player.val_name,
            playerTag: player.val_tag,
            stats: stats,
        });

        if (!matchGroups[matchID]) {
            matchGroups[matchID] = { players: [], lastGame };
        }

        matchGroups[matchID].players.push(player);
    }

    return { matchGroups, playerStatsArray };
}

//Get Random Meme
async function GetRandomMeme(isWinning) {
    //get the number of memes in the database
    const memesCount = await Memes.countDocuments({ isWinning });
    //generate a random number between 0 and the number of memes in the database
    const randomIndex = Math.floor(Math.random() * memesCount);
    // get a random meme
    return await Memes.findOne({ isWinning }).skip(randomIndex).limit(1);
}

// Get the corresponding emoji for the player's rank
function GetRankEmojiName(playerRank) {
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

// Get agent image from agent name
function GetAgentImage(agentName) {
    const agentMapping = {
        'Breach': 'https://static.wikia.nocookie.net/valorant/images/5/53/Breach_icon.png',
        'Brimstone': 'https://static.wikia.nocookie.net/valorant/images/4/4d/Brimstone_icon.png',
        'Cypher': 'https://static.wikia.nocookie.net/valorant/images/8/88/Cypher_icon.png',
        'Jett': 'https://static.wikia.nocookie.net/valorant/images/3/35/Jett_icon.png',
        'Killjoy': 'https://static.wikia.nocookie.net/valorant/images/1/15/Killjoy_icon.png',
        'Omen': 'https://static.wikia.nocookie.net/valorant/images/b/b0/Omen_icon.png',
        'Phoenix': 'https://static.wikia.nocookie.net/valorant/images/1/14/Phoenix_icon.png',
        'Raze': 'https://static.wikia.nocookie.net/valorant/images/9/9c/Raze_icon.png',
        'Reyna': 'https://static.wikia.nocookie.net/valorant/images/b/b0/Reyna_icon.png',
        'Sage': 'https://static.wikia.nocookie.net/valorant/images/7/74/Sage_icon.png',
        'Sova': 'https://static.wikia.nocookie.net/valorant/images/4/49/Sova_icon.png',
        'Viper': 'https://static.wikia.nocookie.net/valorant/images/5/5f/Viper_icon.png',
        'Yoru': 'https://static.wikia.nocookie.net/valorant/images/d/d4/Yoru_icon.png',
        'Astra': 'https://static.wikia.nocookie.net/valorant/images/0/08/Astra_icon.png',
        'Skye': 'https://static.wikia.nocookie.net/valorant/images/3/33/Skye_icon.png',
        'KAY/O': 'https://static.wikia.nocookie.net/valorant/images/f/f0/KAYO_icon.png',
        'Chamber': 'https://static.wikia.nocookie.net/valorant/images/0/09/Chamber_icon.png',
        'Harbor': 'https://static.wikia.nocookie.net/valorant/images/f/f3/Harbor_icon.png',
        'Gekko': 'https://static.wikia.nocookie.net/valorant/images/6/66/Gekko_icon.png',
        'Neon': 'https://static.wikia.nocookie.net/valorant/images/d/d0/Neon_icon.png',
        'Fade': 'https://static.wikia.nocookie.net/valorant/images/a/a6/Fade_icon.png',
    };
    
    return agentMapping[agentName] || '';
}

module.exports = {
    ParsePlayerNameAndTag,
    GroupPlayersByMatch,
    GetRandomMeme,
    GetRankEmojiName,
    GetAgentImage,
};
