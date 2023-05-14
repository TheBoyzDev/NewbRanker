const { v4: uuidv4 } = require('uuid');
const { Client, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ValorantPlayer = require('../../models/ValorantPlayer')

module.exports = {
    callback: async (client, interaction) => {
        try {
            if (!interaction.inGuild()) {
                interaction.reply('You can only run this command inside a server.');
                return;
            }

            await interaction.deferReply();

            // Generate a new UUID
            const uuid = uuidv4();


            // Find user in the database
            const existingUser = await ValorantPlayer.findOne({ discordName: interaction.user.tag });

            // Update the document with the user's Discord ID or create a new one if it doesn't exist
            const filter = { _id: existingUser._id };
            const update = {
                code: uuid,
                expireAt: new Date(),
                type: 'link'
            };
            const options = { new: true };
    
            await ValorantPlayer.updateOne(filter, update, options);

            // Construct the Riot OAuth URL
            const riotOauthUrl = `https://valorantlabs.xyz/v1/rso/redirect/${uuid}`;

            // Create a button that redirects to the Riot OAuth URL
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(riotOauthUrl)
                .setLabel('Login with Riot Account');

            const row = new ActionRowBuilder()
                .addComponents(button);

            // Reply with the button
            await interaction.editReply({ content: 'Click the button below to login with your Riot account:', components: [row] });

        } catch (error) {
            console.error(error);
            interaction.editReply('Error registering Valorant account 🙁. Please check the player name and tagline, if the account has recent games or try again later.');
        }
    },
    name: 'vallogin',
    description: 'Login with you Valorant account',
};
