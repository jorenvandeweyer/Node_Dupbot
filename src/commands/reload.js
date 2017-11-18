module.exports = {
    name: "reload",
    description: "!reload",
    defaultPermission: 4,
    failPermission: "You can't reload the bot",
    args: 0,
    guildOnly: true,
    execute(self, msg){
        message = self.createEmbed("info", "reloading..");
    	self.send(msg, message, function(){
    		self.listener().emit("reload");
    	});
    }
};
