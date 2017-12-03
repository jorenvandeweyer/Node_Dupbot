module.exports = {
    name: "iam",
    description: "!iam <role>",
    usage: "<role>",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.db.getSettings(msg.guild.id, "iam_roles", (value) => {
            self.db.getSettings(msg.guild.id, "max_iam_roles", (max_roles) => {
                let max = parseInt(max_roles);
                if(max < 0) max = Infinity;

                let roles = value.split(",");

                let message;

                if(msg.params.length >= 1){
                    let role = msg.params[0];
                    let index = roles.indexOf(role);
                    if(index >= 0){
                        let roleId = roles[index-1];

                        if(self.serverManager().getRoles(msg).indexOf(roleId) == -1){
                            if(!exceededRoleLimit(self, msg, roles, max)){
                                self.addToRole(msg, msg.author.id, roleId);
                                message = self.createEmbed("succes", "You assign succesfully the role <@&" + roleId + "> to yourself.");
                            } else {
                                message = self.createEmbed("fail", "Exceeded iam role limit");
                            }
                        } else {
                            self.removeFromRole(msg, msg.author.id, roleId);
                            message = self.createEmbed("succes", "You removed the role <@&" + roleId + "> succesfully from yourself");
                        }
                    } else {
                        message= self.createEmbed("fail", "This is not a role or you can't assign yourself this role.");
                    }
                } else {
                    let allRoles = [];
                    for (let i = 1; i < roles.length; i+=2){
                        allRoles.push(roles[i]);
                    }

                    message = self.createEmbed("info", allRoles.join(", "), "All assignable roles:");
                }
                self.send(msg, message);
            });
    	});
    }
};

function exceededRoleLimit(self, msg, iam_roles, max){
    let roles = self.serverManager().getRoles(msg);

    let numberOfRoles = 0;

    for(let i = 0; i < iam_roles.length; i+=2){
        if(roles.includes(iam_roles[i])){
            numberOfRoles++;
        }
    }
    return numberOfRoles >= max;
}
