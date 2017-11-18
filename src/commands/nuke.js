module.exports = {
    name: "nuke",
    description: "!nuke <amount>",
    usage: "<amount>",
    defaultPermission: 3,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if(msg.params.length >= 1){
    		messageLimit = msg.params[0];
    	} else {
    		messageLimit = 50;
    	}

    	msg.channel.bulkDelete(messageLimit);
    }
};
