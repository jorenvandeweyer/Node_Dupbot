module.exports = {
    name: "help",
    description: "!help <command>",
    defaultPermission: 1,
    usage: "<command>",
    args: 0,
    execute(self, msg){
        self.getPrefix(msg, (prefix) => {
            if (msg.params.length >= 1){
        		let helpmsg = "No command";
                let command = msg.client.commands.get(msg.params[0]);
                if (command){
                    if(command.usage){
                        helpmsg = `\`${prefix}${command.name} ${command.usage}\``
                    } else {
                        helpmsg = `\`${prefix}${command.name}\``;
                    }
                }
        		message = self.createEmbed("info", helpmsg);
        		self.send(msg, message);
        	} else {
        		message = self.createEmbed("info", "All available commands, more info " + prefix + "help <command>", "Commands", [
        		{
        			name: "Everyone",
        			value: prefix + "ping, " + prefix + "getroles, " + prefix + "kill, " + prefix + "help, " + prefix + "iam, " + prefix + "graphs"
        		},{
        			name: "Music",
        			value: prefix + "play, " + prefix + "skip, " + prefix + "queue"
        		},{
        			name: "Cards Against Humanity",
        			value: prefix + "cstart, " + prefix + "cjoin, " + prefix + "cleave, " + prefix + "c, " + prefix + "cscoreboard, " + prefix + "creset",
        		},{
        			name: "Admin only",
        			value: prefix + "kick, " + prefix + "warn, " + prefix + "ban, " + prefix + "tempban, " + prefix + "unban, " + prefix + "setrole, " + prefix + "delrole,\n" + prefix + "set, " + prefix + "say, " + prefix + "silence, " + prefix + "unsilence, " + prefix + "see, " + prefix + "nuke\n" + prefix + "settings, " + prefix + "permissions"
        		}
        		]);
        		self.send(msg, message);
        	}
        });
    }
};
