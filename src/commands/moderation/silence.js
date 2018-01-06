module.exports = {
    name: "silence",
    usage: "@name|userID",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		if(Client.serverManager.extractID(msg, 0)){
    			Client.silence(msg, Client.serverManager.extractID(msg, 0));
    		}
    	}
    }
};
