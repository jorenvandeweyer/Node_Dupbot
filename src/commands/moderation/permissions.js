module.exports = {
    name: "permissions",
    defaultPermission: 3,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        Client.db.getPermissions(msg.guild.id, "allPermissions").then((permissions) => {
            let disabled = [];
            let everyone =  [];
            let mod = [];
            let owner = [];
            let botOwner = [];

            for (let i = 0; i < permissions.length; i++) {
                let command = permissions[i].command;
                switch (permissions[i].value) {
                    case 0:
                        disabled.push(command);
                        break;
                    case 1:
                        everyone.push(command);
                        break;
                    case 2:
                        mod.push(command);
                        break;
                    case 3:
                        owner.push(command);
                        break;
                    case 4:
                        botOwner.push(command);
                        break;
                    default:
                }
            }
            if (!disabled.length) disabled.push("-");
            if (!everyone.length) everyone.push("-");
            if (!mod.length) mod.push("-");
            if (!owner.length) owner.push("-");

            let message = Client.createEmbed("info", "Permissions of all commands", "Permissions", [
                {
                    name: "Disabled",
                    value: disabled.join(", ")
                }, {
                    name: "Everyone",
                    value: everyone.join(", ")
                }, {
                    name: "Moderator",
                    value: mod.join(", ")
                }, {
                    name: "Owner",
                    value: owner.join(", ")
                }
            ]);
            Client.send(msg, message);
        });
    }
};
