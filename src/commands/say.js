module.exports = {
    name: "say",
    description: "!say <text>",
    usage: "<text>",
    defaultPermission: 2,
    failPermission: "You can't say things",
    args: 1,
    execute(self, msg){
        message = self.createEmbed("info", msg.params.join(" "));
    	self.send(msg, message);
    }
};
