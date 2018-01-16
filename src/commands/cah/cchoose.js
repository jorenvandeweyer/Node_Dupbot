module.exports = {
    name: "c",
    usage: "<card>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.cah.choose(Client, msg);
    }
};
