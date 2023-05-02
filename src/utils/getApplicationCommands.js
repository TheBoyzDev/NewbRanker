module.exports = async (client, guildId) => {
    let applicationCommands;
  
    if (guildId) {
      const guild = await client.guilds.fetch(guildId);
      applicationCommands = guild.commands;
      console.log("applicationCommands: " + applicationCommands);
    } else {
      applicationCommands = await client.application.commands;
    }
  
    await applicationCommands.fetch();
    return applicationCommands;
  };