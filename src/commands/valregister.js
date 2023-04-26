const { fetchAccountData, fetchRankData, getLastGameInfo } = require('../utils/api');
const ValorantPlayer = require('../models/ValorantPlayer');

async function handleValRegister(msg, playerName, playerTag) {
    try {
        // Fetch account data from the API
        const accountData = await fetchAccountData(playerName, playerTag);
        const puuid = accountData.data.puuid;
        const region = accountData.data.region;
        const playerCardURL = accountData.data.card.wide;

        // Fetch rank data from the API
        const rankData = await fetchRankData(region, puuid);
        const playerRank = rankData.data.currenttierpatched;
        const rankImageURL = rankData.data.images.large;
        const elo = rankData.data.elo;
        const discordName = msg.author.tag;

        // Get last game info
        const lastGameInfo  = await getLastGameInfo(puuid);

        const newPlayer = new ValorantPlayer({
            discordName,
            val_name: playerName,
            val_tag: playerTag,
            val_puuid: puuid,
            val_region: region,
            val_playerCardURL: playerCardURL,
            val_playerRank: playerRank,
            val_rankImageURL: rankImageURL,
            val_lastGameID: lastGameInfo.data.data[0].meta.id,
            val_elo: elo
        });

        // Save the new player to the database
        await newPlayer.save();

        msg.reply('Valorant account registered successfully.');
    } catch (error) {
        console.error(error);
        msg.reply('Error registering Valorant account. Please check the player name and tagline, or try again later.');
    }
}

module.exports = {
    handleValRegister
};
