const {
    Client,
    Interaction
  } = require('discord.js');

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

            // Check if the user has admin permissions
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.permissions.has('ADMINISTRATOR')) {
                interaction.editReply('You are a PLEBIE you do not have permission to use this command. sadge 🙁');
                return;
            }

            // Get the channel where the command was executed
            const channel = interaction.channel;

            // Delete all the messages in the channel
            const messages = await channel.messages.fetch();
            await channel.bulkDelete(messages, true);

        }catch(error){
            console.log(error);
        }
    },
    name: 'cleanchat',
    description: 'Clean the chat of the channel where the command was executed',
  }