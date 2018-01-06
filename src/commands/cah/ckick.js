module.exports = {
    name: "ckick",
    description: "!ckick",
    defaultPermission: 2,
    failPermission: "You can't kick a player from this game",
    args: 1,
    usage: "@player",
    guildOnly: true,
    execute(Client, msg){
        Client.cah.kick(Client, msg);
    }
};
