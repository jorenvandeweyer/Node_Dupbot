module.exports = {
    name: "iam",
    usage: "<role>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    async execute (Client, msg) {
        let roles = await Client.db.getSettings(msg.guild.id, "iam_roles");
        let max_roles = await Client.db.getSettings(msg.guild.id, "max_iam_roles");

        max_roles = parseInt(max_roles);
        if (max_roles < 0) max_roles = Infinity;

        roles = roles.split(",").map(x => x.toLowerCase());
        let message;

        if (msg.params.length >= 1) {
            let role = msg.params[0].toLowerCase();
            let index = roles.indexOf(role);
            if (index >= 0) {
                let roleId = roles[index-1];

                if (!msg.member.roles.has(roleId)) {
                    if (!exceededRoleLimit(Client, msg, roles, max_roles)) {
                        await msg.guild.members.get(msg.author.id).addRole(roleId).then(() => {
                            message = Client.createEmbed("succes", "You succesfully assigned the role <@&" + roleId + "> to yourself.");
                        }).catch(() => {
                            message = Client.createEmbed("fail", "Not a role");
                        });
                    } else {
                        message = Client.createEmbed("fail", "Exceeded iam role limit");
                    }
                } else {
                    await msg.guild.members.get(msg.author.id).removeRole(roleId).then(() => {
                        message = Client.createEmbed("succes", "You succesfully removed the role <@&" + roleId + "> from yourself");
                    }).catch(() => {
                        message = Client.createEmbed("fail", "Not a role");
                    });
                }
            } else {
                message= Client.createEmbed("fail", "`" + role + "` isn't a valid role or you are not allowed to assign the role `" + role + "` to yourself.");
            }
        } else {
            let allRoles = [];
            for (let i = 1; i < roles.length; i+=2) {
                allRoles.push(roles[i]);
            }

            message = Client.createEmbed("info", allRoles.join(", "), "All assignable roles:");
        }
        Client.send(msg, message);
    }
};

function exceededRoleLimit(Client, msg, iam_roles, max) {
    let roles = msg.member.roles.keyArray();

    let numberOfRoles = 0;

    for (let i = 0; i < iam_roles.length; i+=2) {
        if (roles.includes(iam_roles[i])) {
            numberOfRoles++;
        }
    }
    return numberOfRoles >= max;
}
