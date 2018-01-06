module.exports = {
    name: "unban",
    description: "!unban userID",
    usage: "userId",
    defaultPermission: 2,
    failPermission: "You can't unban people :point_up:",
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		if(msg.params[0] in Client.serverManager().users[msg.guild.id].bans){
    			Client.unban(msg, msg.params[0]);
    			Client.log(msg, msg.params[0], "unban");
    		}
    	} else {
    		title = "Banned players:";
    		message = "";
    		let bans = Client.serverManager().users[msg.guild.id].bans;
    		for(key in bans){
    			message += "  * " + bans[key] + ": " + key + "\n";
    		}
    		message = Client.createEmbed("info", message, title);
    		Client.db.getSettings(msg.guild.id, "logchannel", (channelId) => {
    			Client.sendChannel(msg, channelId, message);
    		});
    	}
    }
};
