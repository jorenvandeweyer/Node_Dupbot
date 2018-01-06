module.exports = {
    name: "silence",
    description: "!silence @name",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		if(Client.serverManager().getMention(msg)){
    			Client.silence(msg, Client.serverManager().getMention(msg));
    		}
    	}
    }
};
