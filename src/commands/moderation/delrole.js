module.exports = {
    name: "delrole",
    usage: "@name|userID @role|roleID",
    defaultPermission: 2,
    failPermission: "You can't remove roles.",
    args: 2,
    guildOnly: true,
    execute (Client, msg) {
        let userID = Client.extractID(msg, 0);
        let roleID = Client.extractRoleID(msg, 1);

        msg.guild.members.get(userID).removeRole(roleID).then((member) => {
            Client.send(msg, Client.createEmbed("succes", `Removed <@&${roleID}> from <@${member.id}>`));
        }).catch(() => {
            Client.send(msg, Client.createEmbed("fail", "Not a valid role or user"));
        });
    }
};
