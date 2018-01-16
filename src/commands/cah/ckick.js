module.exports = {
    name: "ckick",
    usage: "@player",
    defaultPermission: 2,
    failPermission: "You can't kick a player from this game",
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.cah.kick(Client, msg);
    }
};
