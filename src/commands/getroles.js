module.exports = {
    name: "getroles",
    description: "!getroles",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        message = self.createEmbed("info", self.serverManager().getRoles(msg).map(x => ("<@&" + x + ">")).join(", "), "Roles");
    	self.send(msg, message);
    }
};
