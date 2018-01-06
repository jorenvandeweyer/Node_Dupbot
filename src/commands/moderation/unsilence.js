module.exports = {
    name: "unsilence",
    description: "!unsilence @name",
    usage: "@name",
    defaultPermission: 2,
    failPermission: "You can't unsilence people :point_up:",
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		if(Client.serverManager().getMention(msg)){
    			Client.unSilence(msg, Client.serverManager().getMention(msg));
    		}
    	}
    }
};
