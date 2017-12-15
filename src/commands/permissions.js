module.exports = {
    name: "permissions",
    description: "!permissions",
    defaultPermission: 3,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.db.getPermissions(msg.guild.id, "allPermissions", (permissions) => {
    		let disabled = [];
    		let everyone =  [];
    		let mod = [];
    		let owner = [];
    		let botOwner = [];

    		for(let i = 0; i < permissions.length; i++){
    			let command = permissions[i].command;
    			switch (permissions[i].value) {
    				case 0:
    					disabled.push(command);
    					break;
    				case 1:
    					everyone.push(command);
    					break;
    				case 2:
    					mod.push(command);
    					break;
    				case 3:
    					owner.push(command);
    					break;
    				case 4:
    					botOwner.push(command);
    					break;
    				default:

    			}
    		}
            
    		message = self.createEmbed("info", "Permissions of all commands", "Permissions", [
    			{
    				name: "Disabled",
    				value: disabled.join(", ")
    			}, {
    				name: "Everyone",
    				value: everyone.join(", ")
    			}, {
    				name: "Moderator",
    				value: mod.join(", ")
    			}, {
    				name: "Owner",
    				value: owner.join(", ")
    			}
    		]);
    		self.send(msg, message);
    	});
    }
};
