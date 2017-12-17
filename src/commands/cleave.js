module.exports = {
    name: "cleave",
    description: "!cleave",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.cah.leave(self, msg);
    }
};
