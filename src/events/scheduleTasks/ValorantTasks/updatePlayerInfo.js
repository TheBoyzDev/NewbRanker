const cron = require('node-cron');
const ValorantPlayer = require('../../../models/ValorantPlayer');
const { FetchAccountData, FetchRankData } = require('../../../utils/api');

module.exports = async () => {
    cron.schedule('* * * * *', async () => {
        try{
            const players = await ValorantPlayer.find();
    
            for (const player of players) {
                //Fetch account data from the API
                const accountData = await FetchAccountData(player.val_name, player.val_tag);
                const playerCardURL = accountData.data.card.wide;
    
                // Fetch rank data from the API
                const rankData = await FetchRankData(player.val_region, player.val_puuid);
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
        
    });
};