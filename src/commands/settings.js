module.exports = {
    name: "settings",
    description: "!settings",
    defaultPermission: 3,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.db.getSettings(msg.guild.id, "allSettings", (settings) => {
    		let message = "Settings	- Value";
    		for(let i = 0; i < settings.length; i++){
    			message += "\n" + settings[i].setting + ": " + settings[i].value;
    		}

    		messsage = self.createEmbed("info", message, "Settings for this server");
    		self.send(msg, message);
    	});
    }
};
