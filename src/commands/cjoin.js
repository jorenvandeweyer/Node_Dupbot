module.exports = {
    name: "cjoin",
    description: "!cjoin",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.cah.join(self, msg);
    }
};
