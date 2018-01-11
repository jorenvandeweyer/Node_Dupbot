module.exports = {
    name: "help",
    description: "!help <command>",
    defaultPermission: 1,
    usage: "<command>",
    args: 0,
    execute(Client, msg){
        if(msg.channel.type == "text"){
            Client.getPrefix(msg, (prefix) => {
                Client.db.getPermissions(msg.guild.id, "allPermissions").then((permissions) => {

                    permissions = sortPermissions(permissions);

                    if (msg.params.length >= 1){
                		let helpmsg = "No command";
                        let command = msg.client.commands.get(msg.params[0]);
                        if (command){
                            if(permissions.keys[command.name] == 0){
                                helpmsg = `The command \`${command.name}\` is disabled`;
                            } else if(msg.permissionLevel < permissions.keys[command.name]){
                                helpmsg = `You don't have access to \`${command.name}\``;
                            } else {
                                if(command.usage){
                                    helpmsg = `\`${prefix}${command.name} ${command.usage}\``;
                                } else {
                                    helpmsg = `\`${prefix}${command.name}\``;
                                }
                            }

                        }
                		message = Client.createEmbed("info", helpmsg);
                		Client.send(msg, message);
                	} else {
                        // const cahCommands = ["cstart", "cjoin", "cleave", "c", "cscoreboard", "creset"];
                        // const musicCommand = ["play", "skip", "queue"];
                        let embed = new Client.Discord.RichEmbed();
                        embed.setTitle("Commands");
                        embed.setColor(3447003)
                        embed.setURL('https://dupbit.com/dupbot');
                        embed.addField("Everyone", permissions.everyone.join(", "));
                        embed.addField("Admin only", permissions.mod.join(", "));
                        embed.addField("Owner only", permissions.owner.join(", "));
                        embed.setDescription(prefix + "help <command> or click on the title to go to the help page");
                        // [
                        //     {
                        //         name: "Music",
                        //         value: "play, skip, queue"
                        //     },{
                        //         name: "Cards Against Humanity",
                        //         value: "cstart, cjoin, cleave, c, cscoreboard, creset",
                        //     },
                        // ]

                		Client.send(msg, embed);
                	}
            	});
            });
        } else {

            if (msg.params.length >= 1){
                let helpmsg = "No command";
                let command = msg.client.commands.get(msg.params[0]);
                if (command){
                    if(command.usage){
                            helpmsg = `\`!${command.name} ${command.usage}\``;
                    } else {
                            helpmsg = `\`!${command.name}\``;
                    }
                }
                message = Client.createEmbed("info", helpmsg);
                Client.send(msg, message);
            } else {
                let commands = msg.client.commands.clone();

                commands = commands.filter((command) => {
                    if(command.guildOnly || command.defaultPermission > 3) return false;
                    return true;
                });

                let embed = new Client.Discord.RichEmbed();
                embed.setTitle("Commands");
                embed.setColor(3447003)
                embed.setURL('https://dupbit.com/dupbot');
                embed.addField("DM only", commands.keyArray().join(", "));
                embed.setDescription(prefix + "help <command> or click on the title to go to the help page");

                Client.send(msg, embed);
            }
        }
    }
}

function sortPermissions(permissions){
    let disabled = [];
    let everyone =  [];
    let mod = [];
    let owner = [];
    let botOwner = [];

    let keys = {};

    for(let i = 0; i < permissions.length; i++){
        let command = permissions[i].command;

        keys[command] = permissions[i].value;

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
    return {
        disabled: disabled,
        everyone: everyone,
        mod: mod,
        owner: owner,
        botOwner: botOwner,
        keys: keys
    };
}
