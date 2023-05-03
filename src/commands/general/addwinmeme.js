const {
    Interaction,
    Client
  } = require('discord.js');

  const Memes = require('../../models/Memes');


  module.exports = {
    /**
    * 
    * @param {Client} client 
    * @param {Interaction} interaction
    * 
    * @returns
    * */

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

            const newMeme = new Memes({
                isLosing: false,
                isWinning: true,
                URL: interaction.options.getString('link')
            });

            await newMeme.save();

            interaction.editReply('Win meme added successfully.');
        }catch(error){
            console.log(error);
        }
    },
    name: 'addwinmeme',
    description: 'Add a winning meme to the database',
    options: [
        {
            name: 'link',
            description: 'The link of the winning meme',
            type: 3, //STRING
            required: true
        }
    ],

  };