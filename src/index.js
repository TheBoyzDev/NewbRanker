require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

//Connections
const connectDB = require('./db'); // Import connectDB

// Connect to MongoDB
connectDB();

// Create a new Discord client
const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
 });

client.on('ready', async () => {
    
    console.log(`Logged in as ${client.user.tag}!`);

});

eventHandler(client);

client.login(process.env.DISCORD_BOT_TOKEN);
