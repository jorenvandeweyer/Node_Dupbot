module.exports = {
    name: "delrole",
    usage: "@name|userID @role|roleID",
    defaultPermission: 2,
    args: 2,
    guildOnly: true,
    execute(Client, msg){
        userID = Client.serverManager.extractID(msg, 0);
    	roleID = Client.serverManager.extractRoleID(msg, 1);

    	if(userID && roleID){
    		Client.removeFromRole(msg, userID, roleID);
    	}
    }
};
