module.exports = {
    name: "cscoreboard",
    description: "!cscoreboard",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.cah.scoreboard(msg);
    }
};
