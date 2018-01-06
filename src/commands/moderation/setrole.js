module.exports = {
    name: "setrole",
    usage: "@name|userID @role|roleID",
    defaultPermission: 2,
    failPermission: "You can't set roles.",
    args: 2,
    guildOnly: true,
    execute(Client, msg){
        userID = Client.serverManager.extractID(msg, 0);
    	roleID = Client.serverManager.extractRoleID(msg, 1);

        msg.guild.members.get(userID).addRole(roleID).then((member) => {
            Client.send(msg, Client.createEmbed("succes", `Assigned <@&${roleID}> to <@${member.id}>`));
        }).catch((reason) => {
            Client.send(msg, Client.createEmbed("fail", "Not a valid role or user"));
        });
    }
};
