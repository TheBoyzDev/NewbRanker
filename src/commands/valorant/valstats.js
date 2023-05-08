const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    AttachmentBuilder,
  } = require('discord.js');

const ValorantPlayer = require('../../models/ValorantPlayer')

const { FetchAccountData, FetchRankData} = require('../../utils/api');
const { ValStatsEmbed } = require('../../utils/embeds');

module.exports = {
    /**
    * 
    * @param {Client} client 
    * @param {Interaction} interaction
    */
    callback : async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply('You can only run this command inside a server.');
            return;
          }
      
          await interaction.deferReply();

        //Get the player name and tag on the DB from the target user
        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;

        const targetUserObj = await interaction.guild.members.fetch(targetUserId);

        const fetchedPlayer = await ValorantPlayer.findOne({ discordName: targetUserObj.user.tag });

        const accountData = await FetchAccountData(fetchedPlayer.val_name, fetchedPlayer.val_tag);
        const puuid = accountData.data.puuid;
        const region = accountData.data.region;
        const playerCardURL = accountData.data.card.wide;

        const rankData = await FetchRankData(region, puuid);
        const playerRank = rankData.data.currenttierpatched;
        const rankImageURL = rankData.data.images.large;

        const embed = ValStatsEmbed(fetchedPlayer.val_name, fetchedPlayer.val_tag, playerRank, playerCardURL, rankImageURL);

        if(!fetchedPlayer){
            interaction.editReply(
                mentionedUserId 
                    ? `${targetUserObj.user.tag} hasn't set their Valorant account yet` : 'You haven\'t set your Valorant account yet' 
            );
            return;
        }

        interaction.editReply({ embeds: [embed] });
        
    },
    
    name: 'valstats',
    description: 'Get Valorant stats for a player',
    options: [
        {
          name: 'target-user',
          description: 'The player whose stats you want to see',
          type: ApplicationCommandOptionType.Mentionable,
        }
    ],
};
