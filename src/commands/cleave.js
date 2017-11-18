module.exports = {
    name: "cleave",
    description: "!cleave",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        console.log(self.cah);
        self.cah.leave(msg);
    }
};
