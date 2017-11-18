module.exports = {
    name: "speed",
    description: "!speed [market] [all]",
    usage: "[market] [all]",
    defaultPermission: 0,
    args: 0,
    execute(self, msg){
        if (msg.params.length == 0){
    		self.broadcastNextSpeed(msg, "nl");
    	} else if(msg.params.length == 1){
    		self.broadcastNextSpeed(msg, msg.params[0]);
    	} else {
    		if (msg.params[1] == "all"){
    			self.broadcastSpeed(msg, msg.params[0]);
    		} else {
    			message = self.createEmbed("info", speedCommand.help);
    			self.send(msg, message);
    		}
    	}
    }
};
