module.exports = {
    name: "delrole",
    description: "!delrole @name @role",
    usage: "@name @role",
    defaultPermission: 2,
    args: 2,
    guildOnly: true,
    execute(Client, msg){
        userID = Client.serverManager().getMention(msg);
    	roleID = Client.serverManager().getMentionRole(msg);

    	if(userID && roleID){
    		Client.removeFromRole(msg, userID, roleID);
    	}
    }
};
