require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
const schedule = require('node-schedule');

const { handleValStats, updatePlayersInfo } = require('./commands/valstats');
const { handleValRegister } = require('./commands/valregister');
const { handleValLeaderboard } = require('./commands/valleaderboard');
const { parsePlayerNameAndTag } = require('./utils/helpers');
const { getLastGameInfo } = require('./utils/api');
const { sendGameUpdate } = require('./utils/embeds');

const { handleAddWinMeme } = require('./commands/addWinMeme');
const { handleAddLostMeme } = require('./commands/addLostMeme');

//Models
const ValorantPlayer = require('./models/ValorantPlayer')

//Connections
const connectDB = require('./db'); // Import connectDB

// Connect to MongoDB
connectDB();

const leaderboardUpdateSchedule = '0 */4 * * *'; // Run every 4 hours at 0 minutes

// Create a new Discord client
const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
 });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async msg => {
    if (msg.content.startsWith('!valstats')) {
        // Remove !valstats from the message
        msg.content = msg.content.replace('!valstats', '');

        // Extract playerName and playerTag
        const { playerName, playerTag } = parsePlayerNameAndTag(msg.content);

        console.log(playerName);
        console.log(playerTag);

        // Handle the !valstats command
        handleValStats(msg, playerName, playerTag);
    }
    
    //Val Register
    if(msg.content.startsWith('!valregister'))
    {
        msg.content = msg.content.replace('!valregister', '');

        //Validate if the player is already registered
        const discordName = msg.author.tag;
        const existingPlayer = await ValorantPlayer.findOne({ discordName });

        if (existingPlayer) {
            msg.reply('You have already registered a Valorant account. You cannot register multiple accounts.');
            return;
        }

        const { playerName, playerTag } = parsePlayerNameAndTag(msg.content);

        handleValRegister(msg, playerName, playerTag);
    }

    //Val Leaderboard
    if (msg.content.startsWith('!valleaderboard')) {
        await handleValLeaderboard();
    }

    // Message == !cleanchat
    if (msg.content === '!cleanchat') {
        try {
            // Fetch messages in the channel
            const messages = await msg.channel.messages.fetch();
            console.log(`Fetched ${messages.size} messages.`);

            // Bulk delete messages (limited to 100 messages)
            await msg.channel.bulkDelete(messages, true);
            console.log('Messages deleted.');
        } catch (err) {
            console.error(err);
            msg.reply('Error while attempting to clean the chat. Please try again later.');
        }
    }
    
    //Add Win Meme
    if (msg.content.startsWith('!win')) {
        const link = msg.content.replace('!win', '').trim();
        handleAddWinMeme(msg, link);
    }
    //Add Lost Meme
    if (msg.content.startsWith('!lost')) {
        const link = msg.content.replace('!lost', '').trim();
        handleAddLostMeme(msg, link);
    }
});

// Schedule the job to run every minute
schedule.scheduleJob('* * * * *', async () => {

    //Update players info
    updatePlayersInfo();

    const players = await ValorantPlayer.find();
    const channel = client.channels.cache.find((ch) => ch.name === 'rank-status');

    for (const player of players) {
        const lastGameInfo = await getLastGameInfo(player.val_puuid);

        if (lastGameInfo.status === 'error') {
            console.error(lastGameInfo.message);
            continue;
        }

        const lastGame = lastGameInfo.data.data[0];

        if (player.val_lastGameID !== lastGame.meta.id) {
            const playerTeam = lastGame.stats.team;
            const playerTeamScore = lastGame.teams[playerTeam.toLowerCase()];
            const opponentTeamScore = lastGame.teams[playerTeam.toLowerCase() === 'blue' ? 'red' : 'blue'];
            const isWinning = playerTeamScore > opponentTeamScore;

            // Get the game update embed message
            const gameUpdateEmbed = await sendGameUpdate(player, isWinning);
            // Send the embed message to the channel
            await channel.send({ embeds: [gameUpdateEmbed] });

            await ValorantPlayer.findByIdAndUpdate(player._id, { val_lastGameID: lastGame.meta.id });
        }
    }
});

// Schedule the job to run every 4 hours
schedule.scheduleJob(leaderboardUpdateSchedule, async () => {
    await handleValLeaderboard();
});



client.login(process.env.DISCORD_BOT_TOKEN);