module.exports = {
    name: "tempban",
    description: "!tempban @user <time> [reason]",
    usage: "@user <time> [reason]",
    defaultPermission: 2,
    failPermission: "You can't ban people :point_up:",
    args: 3,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		if(self.serverManager().getMention(msg)){
    			if(msg.params.length >= 3){
    				let message = "You are banned for " + msg.params[1] + " days, because: ";
    				let reason = "";
    				for (i = 2; i<msg.params.length; i++){
    					reason += " " + msg.params[i];
    				}
    				let targetID = self.serverManager().getMention(msg);
    				self.ban(msg, targetID, message + reason, msg.params[1]);
    				self.log(msg, targetID, "tempban", reason, msg.params[1]);
    			} else {
    				message = self.createEmbed("info", "You must specify a time and a reason for a tempban");
    				self.send(msg, message);
    			}
    		}
    	}
    }
};
