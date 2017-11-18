const {prefix} = require("../../serverSettings.json");

module.exports = {
    name: "help",
    description: "!help <command>",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
    	if (msg.params.length >= 1){
    		let helpmsg = "No command";
            let command = msg.client.commands.get(msg.params[0]);
            if (command){
                if(command.usage){
                    helpmsg = `\`${self.serverManager().prefix}${command.name} ${command.usage}\``
                } else {
                    helpmsg = `\`${self.serverManager().prefix}${command.name}\``;
                }
            }
    		message = self.createEmbed("info", helpmsg);
    		self.send(msg, message);
    	} else {
    		message = self.createEmbed("info", "All available commands, more info !help <command>", "Commands", [
    		{
    			name: "Everyone",
    			value: "!ping, !getroles, !kill, !help, !iam"
    		},{
    			name: "Music",
    			value: "!play, !skip, !queue"
    		},{
    			name: "Cards Against Humanity",
    			value: "!cstart, !cjoin, !cleave, !c, !cscoreboard, !creset",
    		},{
    			name: "Admin only",
    			value: "!kick, !warn, !ban, !tempban, !unban, !setrole, !delrole,\n!set, !say, !silence, !unsilence, !see, !reload, !nuke\n!settings, !permissions"
    		}
    		]);
    		self.send(msg, message);
    	}
    }
};
