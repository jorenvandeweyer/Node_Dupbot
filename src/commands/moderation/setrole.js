module.exports = {
    name: "setrole",
    description: "!setrole @name @role",
    usage: "@name @role",
    defaultPermission: 2,
    failPermission: "You can't set roles.",
    args: 2,
    guildOnly: true,
    execute(Client, msg){
        userID = Client.serverManager().getMention(msg);
    	roleID = Client.serverManager().getMentionRole(msg);
    	if(userID && roleID){
    		Client.addToRole(msg, userID, roleID);
    	}
    }
};
