module.exports = {
    name: "iam",
    description: "!iam <role>",
    usage: "<role>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.db.getSettings(msg.guild.id, "iam_roles", (value) => {
    		let roles = value.split(",");
    		if(msg.params.length >= 1){
    			let role = msg.params[0];
    			let index = roles.indexOf(role);
    			if(index >= 0){
    				let roleId = roles[index-1];

    				if(self.serverManager().getRoles(msg).indexOf(roleId) == -1){
    					self.addToRole(msg, msg.author.id, roleId);
    				} else {
    					self.removeFromRole(msg, msg.author.id, roleId);
    				}
    			}
    		} else {
    			let allRoles = [];
    			for (let i = 1; i < roles.length; i+=2){
    				allRoles.push(roles[i]);
    			}

    			let message = self.createEmbed("info", allRoles.join(", "), "All assignable roles:");
    			self.send(msg, message);
    		}
    	});
    }
};
