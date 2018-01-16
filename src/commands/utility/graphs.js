module.exports = {
    name: "graphs",
    defaultPermission: 1,
    usage: "<start> <end> (yyyy-mm-dd)",
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        Client.graphs.get(Client, msg);
    }
};
