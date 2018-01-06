module.exports = {
    name: "cstart",
    description: "!cstart [-rounds n] [-cards n]",
    usage: "-rounds <number> -cards <number> -packs <all>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        Client.cah.start(Client, msg);
    }
};
