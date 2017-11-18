module.exports = {
    name: "unsilence",
    description: "!unsilence @name",
    usage: "@name",
    defaultPermission: 2,
    failPermission: "You can't unsilence people :point_up:",
    args: 1,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		if(self.serverManager().getMention(msg)){
    			self.unSilence(msg, self.serverManager().getMention(msg));
    		}
    	}
    }
};
