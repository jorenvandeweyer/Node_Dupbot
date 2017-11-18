module.exports = {
    name: "evalt",
    description: "!evalT <code>",
    usage: "<code>",
    defaultPermission: 4,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        try{
    		const code = msg.params.join(" ");

    		require('child_process').exec(code, function(error, stdout, stderr){
    			msg.channel.send(">" + self.clean(code), {code:"xl"});
    			if(error !== null) msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
    			let message = stdout;
    			if(message.length > 2000){
    				message = self.splitter(message, 2000);
    				while(message.length > 0){
    					msg.channel.send(self.clean(message.shift()), {code: "xl"});
    				}
    			}else {
    				msg.channel.send(self.clean(message), {code: "xl"});
    			}
    		});
    	} catch(err){
    		msg.channel.send(code, {code:"xl"});
    		msg.channel.send(`\`ERROR\` \`\`\`xl\n${self.clean(err)}\n\`\`\``);
    	}
    	return false;
    }
};
