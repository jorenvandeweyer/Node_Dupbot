module.exports = {
    name: "setrole",
    description: "!setrole @name @role",
    usage: "@name @role",
    defaultPermission: 2,
    failPermission: "You can't set roles.",
    args: 2,
    guildOnly: true,
    execute(self, msg){
        userID = self.serverManager().getMention(msg);
    	roleID = self.serverManager().getMentionRole(msg);
    	if(userID && roleID){
    		self.addToRole(msg, userID, roleID);
    	}
    }
};
