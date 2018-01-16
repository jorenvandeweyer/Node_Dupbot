module.exports = {
    name: "setrole",
    usage: "@name|userID @role|roleID",
    defaultPermission: 2,
    failPermission: "You can't set roles.",
    args: 2,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                return Client.send(msg, Client.createEmbed("fail", "This is not a valid member"));
            }

            let role = Client.extractRole(msg, 1);

            if (role === null) {
                return Client.send(msg, Client.createEmbed("fail", "This is not a valid role"));
            }
            member.addRole(role).then((member) => {
                Client.send(msg, Client.createEmbed("succes", `Assigned ${role} to ${member}`));
            }).catch((reason) => {
                Client.send(msg, Client.createEmbed("fail", reason.message));
            });
        });
    }
};
