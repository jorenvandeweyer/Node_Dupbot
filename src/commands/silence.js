module.exports = {
    name: "silence",
    description: "!silence @name",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		if(self.serverManager().getMention(msg)){
    			self.silence(msg, self.serverManager().getMention(msg));
    		}
    	}
    }
};
