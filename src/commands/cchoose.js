module.exports = {
    name: "c",
    description: "!c <card>",
    usage: "<card>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        self.cah.choose(self, msg);
    }
};
