module.exports = {
    name: "cskip",
    description: "!cskip",
    defaultPermission: 2,
    failPermission: "You can't skip a round game",
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        Client.cah.skip(Client, msg);
    }
};
