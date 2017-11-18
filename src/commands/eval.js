module.exports = {
    name: "eval",
    description: "!eval <code>",
    usage: "<code>",
    defaultPermission: 4,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        try{
    		const code = msg.params.join(" ");
    		let evaled = eval(code);

    		if(typeof evaled !== "string"){
    			evaled = require("util").inspect(evaled);
    		}
    		msg.channel.send(">" + self.clean(code), {code:"xl"});
    		msg.channel.send(self.clean(evaled), {code:"xl"});
    	} catch(err){
    		msg.channel.send(self.clean(code), {code:"xl"});
    		msg.channel.send(`\`ERROR\` \`\`\`xl\n${self.clean(err)}\n\`\`\``);
    	}
    	return false;
    }
};
