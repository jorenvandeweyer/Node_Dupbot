module.exports = {
    name: "cstart",
    usage: "-rounds <number> -cards <number> -packs <all>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        Client.cah.start(Client, msg);
    }
};
