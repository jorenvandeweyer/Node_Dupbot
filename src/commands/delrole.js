module.exports = {
    name: "delrole",
    description: "!delrole @name @role",
    usage: "@name @role",
    defaultPermission: 2,
    args: 2,
    guildOnly: true,
    execute(self, msg){
        userID = self.serverManager().getMention(msg);
    	roleID = self.serverManager().getMentionRole(msg);

    	if(userID && roleID){
    		self.removeFromRole(msg, userID, roleID);
    	}
    }
};
