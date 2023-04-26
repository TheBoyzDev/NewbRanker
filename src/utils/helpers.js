function parsePlayerNameAndTag(messageContent) {
    const args = messageContent.split("#");
    const playerName = args[0];
    const playerTag = args[1];

    return { playerName, playerTag };
}

module.exports = {
    parsePlayerNameAndTag
};
