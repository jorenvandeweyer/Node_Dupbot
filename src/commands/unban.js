module.exports = {
    name: "unban",
    description: "!unban userID",
    usage: "userId",
    defaultPermission: 2,
    failPermission: "You can't unban people :point_up:",
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		if(msg.params[0] in self.serverManager().users[msg.guild.id].bans){
    			self.unban(msg, msg.params[0]);
    			self.log(msg, msg.params[0], "unban");
    		}
    	} else {
    		title = "Banned players:";
    		message = "";
    		let bans = self.serverManager().users[msg.guild.id].bans;
    		for(key in bans){
    			message += "  * " + bans[key] + ": " + key + "\n";
    		}
    		message = self.createEmbed("info", message, title);
    		self.db.getSettings(msg.guild.id, "logchannel", (channelId) => {
    			self.sendChannel(msg, channelId, message);
    		});
    	}
    }
};
