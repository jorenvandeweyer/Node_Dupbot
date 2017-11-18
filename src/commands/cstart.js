module.exports = {
    name: "cstart",
    description: "!cstart [-rounds n] [-cards n]",
    usage: "-rounds <number> -cards <number>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        console.log(self.cah);
        self.cah.start(msg);
    }
};
