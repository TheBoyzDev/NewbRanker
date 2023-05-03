const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    let eventFiles = getAllFiles(eventFolder);
    eventFiles.sort();

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    if (eventName === 'scheduleTasks') {
      const scheduleTaskFolders = getAllFiles(eventFolder, true);
      for (const taskFolder of scheduleTaskFolders) {
        const taskFiles = getAllFiles(taskFolder);
        taskFiles.sort();
        for (const taskFile of taskFiles) {
          const taskFunction = require(taskFile);
          console.log(`Loading scheduled task file: ${taskFile}`);
          taskFunction(client);
        }
      }
    } else {
      // Handle events
      client.on(eventName, async (arg) => {
        for (const eventFile of eventFiles) {
          const eventFunction = require(eventFile);
          console.log(`Loading event file: ${eventFile}`);
          await eventFunction(client, arg);
        }
      });
    }
  }
};
