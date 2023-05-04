const {
    Client,
    Interaction
  } = require('discord.js');

const { FetchAccountData, FetchRankData, GetLastGameInfo} = require('../../utils/api');

const ValorantPlayer = require('../../models/ValorantPlayer')


module.exports = {
    /**
    * 
    * @param {Client} client 
    * @param {Interaction} interaction
    * 
    * @returns
    */
    callback : async (client, interaction) => {
        try{
            if (!interaction.inGuild()) {
                interaction.reply('You can only run this command inside a server.');
                return;
            }

            await interaction.deferReply();

            //Validate if the player has already registered
            const player = await ValorantPlayer.findOne({ discordName: interaction.user.tag });
            if(player){
                interaction.editReply('You have already registered your Valorant account');
                return;
            }

            const playerName = interaction.options.getString('player_name');   
            const playerTag = interaction.options.getString('player_tag');

            // Validate if in the playerTag there is a # and if so remove it
            if(playerTag.includes('#')){
                playerTag.replace('#', '');
            }

            // Fetch account data from the API
            const accountData = await FetchAccountData(playerName, playerTag);
            const puuid = accountData.data.puuid;
            const region = accountData.data.region;
            const playerCardURL = accountData.data.card.wide;


            // Fetch rank data from the API
            const rankData = await FetchRankData(region, puuid);
            const playerRank = rankData.data.currenttierpatched;
            const rankImageURL = rankData.data.images.large;
            const elo = rankData.data.elo;
            const discordName = interaction.user.tag;

            // Get last game info
            const lastGameInfo  = await GetLastGameInfo(puuid);

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

        interaction.editReply('🎉Valorant account registered successfully.');

        }catch(error){
            console.error(error);
            interaction.editReply('Error registering Valorant account 🙁. Please check the player name and tagline, if the account has recent games or try again later.');
        }
    },
    name: 'valregister',
    description: 'Register your Valorant account',
    //deleted: true,
    options: [
        {
            name: 'player_name',
            description: 'Valorant player name',
            type: 3,
            required: true
        },
        {
            name: 'player_tag',
            description: 'Valorant player tag',
            type: 3, // STRING
            required: true
        }
    ],
};