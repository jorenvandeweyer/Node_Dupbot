module.exports = {
    name: "kick",
    description: "!kick @user [reason]",
    usage: "@user [reason]",
    defaultPermission: 2,
    failPermission: "You can't kick people :point_up:",
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		let targetID = Client.serverManager().getMention(msg);
    		if(targetID){
    			if(msg.params.length >= 2){
    				let message = "You are kicked because: ";
    				let reason = "";
    				for (i = 1; i<msg.params.length; i++){
    					reason += " " + msg.params[i];
    				}
    				Client.kick(msg, targetID, message + reason);
    				Client.log(msg, targetID, "kick", reason);
    			} else {
    				Client.kick(msg, targetID );
    				Client.log(msg, targetID, "kick", "No reason specified");
    			}
    		}
    	}
    }
};
