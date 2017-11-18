module.exports = {
    name: "warn",
    description: "!warn @user [reason]",
    usage: "@user [reason]",
    defaultPermission: 2,
    failPermission: "You can't warn people :point_up:",
    args: 1,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		let targetID = self.serverManager().getMention(msg);
    		if(targetID){
    			let message = "<@" + targetID + "> warning! You got a warning for: ";

    			if(msg.params.length >= 2){
    				let reason =  "";
    				for (i = 1; i<msg.params.length; i++){
    					reason += " " + msg.params[i];
    				}
    				msg.client.users.get(targetID).send(message + reason)
    				self.log(msg, targetID, "warn", reason);
    				self.warn(msg, targetID, message + reason);
    			} else {
    				msg.client.users.get(targetID).send("Warning! Behave yourself or you'll be kicked")
    				self.log(msg, targetID, "warn", "No reason specified");
    				self.warn(msg, targetID, "<@" + targetID + "> warning! Behave!");
    			}
    		}
    	}
    }
};
