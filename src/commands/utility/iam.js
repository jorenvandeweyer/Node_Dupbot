module.exports = {
    name: "iam",
    description: "!iam <role>",
    usage: "<role>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        Client.db.getSettings(msg.guild.id, "iam_roles", (value) => {
            Client.db.getSettings(msg.guild.id, "max_iam_roles", (max_roles) => {
                let max = parseInt(max_roles);
                if(max < 0) max = Infinity;

                let roles = value.split(",");
                roles = roles.map(x => x.toLowerCase());
                let message;

                if(msg.params.length >= 1){
                    let role = msg.params[0].toLowerCase();
                    let index = roles.indexOf(role);
                    if(index >= 0){
                        let roleId = roles[index-1];

                        if(Client.serverManager.getRoles(msg).indexOf(roleId) == -1){
                            if(!exceededRoleLimit(Client, msg, roles, max)){
                                Client.addToRole(msg, msg.author.id, roleId);
                                message = Client.createEmbed("succes", "You succesfully assigned the role <@&" + roleId + "> to yourClient.");
                            } else {
                                message = Client.createEmbed("fail", "Exceeded iam role limit");
                            }
                        } else {
                            Client.removeFromRole(msg, msg.author.id, roleId);
                            message = Client.createEmbed("succes", "You succesfully removed the role <@&" + roleId + "> from yourClient");
                        }
                    } else {
                        message= Client.createEmbed("fail", "`" + role + "` isn't a valid role or you are not allowed to assign the role `" + role + "` to yourClient.");
                    }
                } else {
                    let allRoles = [];
                    for (let i = 1; i < roles.length; i+=2){
                        allRoles.push(roles[i]);
                    }

                    message = Client.createEmbed("info", allRoles.join(", "), "All assignable roles:");
                }
                Client.send(msg, message);
            });
    	});
    }
};

function exceededRoleLimit(Client, msg, iam_roles, max){
    let roles = Client.serverManager.getRoles(msg);

    let numberOfRoles = 0;

    for(let i = 0; i < iam_roles.length; i+=2){
        if(roles.includes(iam_roles[i])){
            numberOfRoles++;
        }
    }
    return numberOfRoles >= max;
}
