const {
    Client,
    Interaction
  } = require('discord.js');

const { AllPlayersLeaderBoardEmbed } = require('../../utils/Embeds/ValLeaderBoardEmbed');


module.exports = {
    /**
    * 
    * @param {Client} client 
    * @param {Interaction} interaction
    * 
    * @returns
    * */

    callback : async (client, interaction) => {
        let guild, channel;

        try{
            if (!interaction.inGuild()) {
                interaction.reply('You can only run this command inside a server.');
                return;
            }

            await interaction.deferReply();

            // Get the guild and the channel to send the message
            guild = await client.guilds.fetch(interaction.guildId); 
            channel = guild.channels.cache.find(channel => channel.name === 'newb-ranking');

            // Validate if the command was executed in the correct channel
            if(interaction.channelId !== channel.id){
                interaction.editReply(`You can only run this command inside the ${channel} channel`);
                return;
            }

            const embed = await AllPlayersLeaderBoardEmbed(guild);

            //Delete all messages in the channel if exists
            const messages = await channel.messages.fetch();
            messages.forEach(message => message.delete());

            //Send the embed
            channel.send({ embeds: [embed] });

        }catch(error){
            console.log(error);
        }

    },
    name: 'valleaderboard',
    description: 'Get the Updated Valorant leaderboard of all registered players',
}