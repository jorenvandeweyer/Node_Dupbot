module.exports = {
    name: "kick",
    description: "!kick @user [reason]",
    usage: "@user [reason]",
    defaultPermission: 2,
    failPermission: "You can't kick people :point_up:",
    args: 1,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		let targetID = self.serverManager().getMention(msg);
    		if(targetID){
    			if(msg.params.length >= 2){
    				let message = "You are kicked because: ";
    				let reason = "";
    				for (i = 1; i<msg.params.length; i++){
    					reason += " " + msg.params[i];
    				}
    				self.kick(msg, targetID, message + reason);
    				self.log(msg, targetID, "kick", reason);
    			} else {
    				self.kick(msg, targetID );
    				self.log(msg, targetID, "kick", "No reason specified");
    			}
    		}
    	}
    }
};
