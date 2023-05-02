const cron = require('node-cron');
const { UpdateLeaderboard } = require('../../commands/valorant/valleaderboard');

module.exports = async (client) => {
    // Schedule a job to run every 4 hours
    cron.schedule('0/ */4 * * *', () => {
        console.log('Updating leaderboard...');	

        UpdateLeaderboard(client).catch((error) => {
            console.error('Error updating leaderboard:', error);
          });
    });
};