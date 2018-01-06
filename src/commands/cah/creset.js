module.exports = {
    name: "creset",
    description: "!creset",
    defaultPermission: 2,
    failPermission: "You can't reset the game",
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        Client.cah.reset(Client, msg);
    }
};
