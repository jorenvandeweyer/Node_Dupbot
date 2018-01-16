module.exports = {
    name: "cjoin",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        Client.cah.join(Client, msg);
    }
};
