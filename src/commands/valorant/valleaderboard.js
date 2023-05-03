const {
    Client,
    Interaction
  } = require('discord.js');
  
  const { AllPlayersLeaderBoardEmbed } = require('../../utils/Embeds/ValLeaderBoardEmbed');
  
  const UpdateLeaderboard = async (client, interaction = null) => {
    let guild, channel;
  
    try {
      if (interaction) {
        if (!interaction.inGuild()) {
          interaction.reply('You can only run this command inside a server.');
          return;
        }
  
        await interaction.deferReply();
      }
  
      // Get the guild and the channel to send the message
      guild = client.guilds.cache.first();
      channel = guild.channels.cache.find(channel => channel.name === 'newb-ranking');
  
      // Validate if the command was executed in the correct channel
      if (interaction && interaction.channelId !== channel.id) {
        interaction.editReply(`You can only run this command inside the ${channel} channel`);
        return;
      }
  
      const embed = await AllPlayersLeaderBoardEmbed(guild);
  
      // Delete all messages in the channel if exists
      const messages = await channel.messages.fetch();
      messages.forEach(message => message.delete());
  
      // Send the embed
      channel.send({ embeds: [embed] });
  
      // Send a response to the interaction if it exists
      if (interaction) await interaction.editReply('Valorant leaderboard updated.');
  
    } catch (error) {
      console.log(error);
    }
  };
  
  
  module.exports = {
    callback: UpdateLeaderboard,
    name: 'valleaderboard',
    description: 'Get the Updated Valorant leaderboard of all registered players',
  };
  