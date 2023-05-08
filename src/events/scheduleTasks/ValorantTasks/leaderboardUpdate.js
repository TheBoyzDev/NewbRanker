const cron = require('node-cron');
const { callback: UpdateLeaderboard } = require('../../../commands/valorant/valleaderboard');


module.exports = async (client) => {
    // Schedule a job to run every Hour
    cron.schedule('* * * * *', () => {
        console.log('Updating leaderboard...');    

        UpdateLeaderboard(client).catch((error) => {
            console.error('Error updating leaderboard:', error);
        });
    });
};
