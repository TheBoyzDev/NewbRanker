const path = require('path');
const fs = require('fs');

module.exports = (exceptions = []) => {
  let localCommands = [];

  const commandCategoriesPath = path.join(__dirname, '..', 'commands');
  const commandCategories = fs.readdirSync(commandCategoriesPath).filter((file) => {
    return fs.statSync(path.join(commandCategoriesPath, file)).isDirectory();
  });

  for (const commandCategory of commandCategories) {
    const commandCategoryPath = path.join(commandCategoriesPath, commandCategory);
    const commandFiles = fs.readdirSync(commandCategoryPath).filter((file) => {
      return fs.statSync(path.join(commandCategoryPath, file)).isFile();
    });

    for (const commandFile of commandFiles) {
      const commandFilePath = path.join(commandCategoryPath, commandFile);
      const commandObject = require(commandFilePath);

      if (exceptions.includes(commandObject.name)) {
        continue;
      } 

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
