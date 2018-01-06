module.exports = {
    name: "warn",
    description: "!warn @user [reason]",
    usage: "@user [reason]",
    defaultPermission: 2,
    failPermission: "You can't warn people :point_up:",
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		let targetID = Client.serverManager().getMention(msg);
    		if(targetID){
    			let message = "<@" + targetID + "> warning! You got a warning for: ";

    			if(msg.params.length >= 2){
    				let reason =  "";
    				for (i = 1; i<msg.params.length; i++){
    					reason += " " + msg.params[i];
    				}
    				msg.client.users.get(targetID).send(message + reason)
    				Client.log(msg, targetID, "warn", reason);
    				Client.warn(msg, targetID, message + reason);
    			} else {
    				msg.client.users.get(targetID).send("Warning! Behave yourClient or you'll be kicked")
    				Client.log(msg, targetID, "warn", "No reason specified");
    				Client.warn(msg, targetID, "<@" + targetID + "> warning! Behave!");
    			}
    		}
    	}
    }
};
