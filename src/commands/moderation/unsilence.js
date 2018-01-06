module.exports = {
    name: "unsilence",
    usage: "@name|userID",
    defaultPermission: 2,
    failPermission: "You can't unsilence people :point_up:",
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		if(Client.serverManager.extractID(msg, 0)){
    			Client.unSilence(msg, Client.serverManager.extractID(msg, 0));
    		}
    	}
    }
};
