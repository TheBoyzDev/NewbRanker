const Memes = require('../models/Memes');

async function handleAddWinMeme(msg, link) {
    try {
        
        //Initialize the meme
        const newMeme = new Memes({
            isLosing: false,
            isWinning: true,
            URL: link
        });

        // Save the new meme to the database
        await newMeme.save();

        msg.reply('Win meme added successfully.');
    } catch (error) {
        console.error(error);
        msg.reply('Error adding win meme. Please try again later.');
    }
}

module.exports = {
    handleAddWinMeme
};