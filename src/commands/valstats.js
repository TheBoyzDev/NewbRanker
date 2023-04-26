const { fetchAccountData, fetchRankData } = require('../utils/api');
const { valStatsEmbed } = require('../utils/embeds');
//Models
const ValorantPlayer = require('../models/ValorantPlayer')

async function handleValStats(msg, playerName, playerTag) {
    try {
        const accountData = await fetchAccountData(playerName, playerTag);
        const puuid = accountData.data.puuid;
        const region = accountData.data.region;
        const playerCardURL = accountData.data.card.wide;

        const rankData = await fetchRankData(region, puuid);
        const playerRank = rankData.data.currenttierpatched;
        const rankImageURL = rankData.data.images.large;

        const embed = valStatsEmbed(playerName, playerTag, playerRank, playerCardURL, rankImageURL);
        msg.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        msg.reply('Error fetching stats. Please check the player name and tagline, or try again later.');
    }
}



//Update the player's info in the database
async function updatePlayersInfo() {
    try{
        const players = await ValorantPlayer.find();

        for (const player of players) {
            //Fetch account data from the API
            const accountData = await fetchAccountData(player.val_name, player.val_tag);
            const playerCardURL = accountData.data.card.wide;

            // Fetch rank data from the API
            const rankData = await fetchRankData(player.val_region, player.val_puuid);
            const playerRank = rankData.data.currenttierpatched;
            const rankImageURL = rankData.data.images.large;
            const elo = rankData.data.elo;

            const filter = { _id: player._id };
            const update = {
                val_playerCardURL: playerCardURL,
                val_playerRank: playerRank,
                val_rankImageURL: rankImageURL,
                val_elo: elo
            };
            const options = { new: true };

            await ValorantPlayer.updateOne(filter, update, options);

            console.log(`Updated player: ${player.val_name}#${player.val_tag}`);
        }
    }catch(error){
        console.error(error);
    }
}

module.exports = {
    handleValStats,
    updatePlayersInfo
};