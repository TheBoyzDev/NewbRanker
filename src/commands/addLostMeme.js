const Memes = require('../models/Memes');

async function handleAddLostMeme(msg, link) {
    try {
        
        //Initialize the meme
        const newMeme = new Memes({
            isLosing: true,
            isWinning: false,
            URL: link
        });

        // Save the new meme to the database
        await newMeme.save();

        msg.reply('Lost meme added successfully.');
    } catch (error) {
        console.error(error);
        msg.reply('Error adding win meme. Please try again later.');
    }
}

module.exports = {
    handleAddLostMeme
};