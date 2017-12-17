module.exports = {
    name: "cstart",
    description: "!cstart [-rounds n] [-cards n]",
    usage: "-rounds <number> -cards <number> -packs <all>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.cah.start(self, msg);
    }
};
