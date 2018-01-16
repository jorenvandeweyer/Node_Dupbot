module.exports = {
    name: "set",
    usage: "<warntime, log, iamrole, maxiamroles, admin, deleteCommands, perm, ai, music, voice, dj, prefix, support, welcome, welcomeChannel, botupdates> <opt>",
    defaultPermission: 3,
    failPermission: "You can't edit the settings",
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        if (msg.params.length >= 1) {
            switch (msg.params[0]) {
                case "log":
                    log(Client, msg);
                    break;
                case "warntime":
                    warntime(Client, msg);
                    break;
                case "iamrole":
                    iamrole(Client, msg);
                    break;
                case "maxiamroles":
                    maxiamroles(Client, msg);
                    break;
                case "admin":
                    admin(Client, msg);
                    break;
                case "voice":
                    voice(Client, msg);
                    break;
                case "music":
                    music(Client, msg);
                    break;
                case "dj":
                    dj(Client, msg);
                    break;
                case "deleteCommands":
                    deleteCommands(Client, msg);
                    break;
                case "perm":
                    perm(Client, msg);
                    break;
                case "ai":
                    ai(Client, msg);
                    break;
                case "support":
                    support(Client, msg);
                    break;
                case "prefix":
                    prefix(Client, msg);
                    break;
                case "botupdates":
                    botupdates(Client, msg);
                    break;
                case "welcome":
                    welcome(Client, msg);
                    break;
                case "welcomeChannel":
                    welcomeChannel(Client, msg);
                    break;
                default: {
                    let message = Client.createEmbed("info", Client.commands.get("set").usage);
                    Client.send(msg, message);
                }
            }
        } else {
            let message = Client.createEmbed("info", Client.commands.get("set").usage);
            Client.send(msg, message);
        }
    }
};

function log(Client, msg) {
    Client.db.setSettings(msg.guild.id, "logchannel", msg.channel.id).then(() => {
        let message = Client.createEmbed("succes", "Logchannel set.");
        Client.send(msg, message);
    });
}

function warntime(Client, msg) {
    if (msg.params.length >= 2) {
        Client.db.setSettings(msg.guild.id, "warntime", msg.params[1]).then(() => {
            let message = Client.createEmbed("succes", "Warntime set to " + msg.params[1] + " hours.");
            Client.send(msg, message);
        });
    } else {
        let message = Client.createEmbed("info", `${msg.prefix}set warntime <hours>`);
        Client.send(msg, message);
    }
}

function iamrole (Client, msg) {
    if (msg.params.length >= 2) {
        let role = Client.extractRole(msg, 1);
        let roles = [];
        Client.db.getSettings(msg.guild.id, "iam_roles").then((value) => {
            if (value) {
                roles = value.split(",");

                let index = roles.indexOf(role.id.toString());
                if (index >= 0) {
                    roles.splice(index, 2);
                } else {
                    roles.push(role.id);
                    roles.push(role.name);
                }
            } else {
                roles = [role.id, role.name];
            }

            Client.db.setSettings(msg.guild.id, "iam_roles", roles.join(",")).then(() => {
                let allRoles = [];
                for (let i = 1; i < roles.length; i+=2) {
                    allRoles.push(roles[i]);
                }

                let message = Client.createEmbed("info", allRoles.join(", "), "All assignable roles:");
                Client.send(msg, message);
            });

        });

    } else {
        let message = Client.createEmbed("info", `${msg.prefix}set iamrole roleid`);
        Client.send(msg, message);
    }
}

function maxiamroles (Client, msg) {
    if (msg.params.length >= 2) {
        Client.db.setSettings(msg.guild.id, "max_iam_roles", parseInt(msg.params[1])).then(() => {
            let message = Client.createEmbed("info", "Max assignable roles set to: " + parseInt(msg.params[1]));
            Client.send(msg, message);
        });
    }
}

function admin (Client, msg) {
    if (msg.params.length >= 2) {
        let role = Client.extractRole(msg, 1);
        if (role) {
            Client.db.setSettings(msg.guild.id, "adminrole", role.id).then(() => {
                let message = Client.createEmbed("succes", `Adminrole set to ${role}`);
                Client.send(msg, message);
            });
        }
    } else {
        let message = Client.createEmbed("info", `${msg.prefix}set admin roleid`);
        Client.send(msg, message);
    }
}

function voice (Client, msg) {
    let voiceChannel = msg.member.voiceChannelID;
    if (voiceChannel) {
        Client.db.setSettings(msg.guild.id, "voiceChannel", voiceChannel).then(() => {
            let message = Client.createEmbed("succes", "Voice channel set to <#" + voiceChannel + ">");
            Client.send(msg, message);
        });
    } else {
        let message = Client.createEmbed("info", "Go in a voice channel before using this command.");
        Client.send(msg, message);
    }
}

function music (Client, msg) {
    Client.db.setSettings(msg.guild.id, "musicChannel", msg.channel.id).then(() => {
        let message = Client.createEmbed("succes", "Music channel set.");
        Client.send(msg, message);
    });
}

function dj (Client, msg) {
    if (msg.params.length >= 2) {
        let role = Client.extractRole(msg, 1);
        if (role) {
            Client.db.setSettings(msg.guild.id, "djrole", role.id).then(() => {
                let message = Client.createEmbed("succes", `DJ role set to ${role}`);
                Client.send(msg, message);
            });
        }
    }
}

function deleteCommands (Client, msg) {
    Client.db.getSettings(msg.guild.id, "deleteCommands").then((value) => {
        value = value == "true" || value == "1";
        let val = +!value;
        Client.db.setSettings(msg.guild.id, "deleteCommands", val).then(() => {
            let message;
            if (val) {
                message = Client.createEmbed("succes", "Commands will be deleted.");
            } else {
                message = Client.createEmbed("succes", "Commands won't be deleted anymore.");
            }
            Client.send(msg, message);
        });
    });
}

function perm (Client, msg) {
    if (msg.params.length >= 3) {
        let command = msg.params[1];
        let value = msg.params[2];

        Client.db.setPermissions(msg.guild.id, command, value).then(() => {
            let message = Client.createEmbed("info", "Permission for `" + command + "` set to `" + value +"`");
            Client.send(msg, message);
        }).catch(() => {
            Client.send(msg, Client.createEmbed("fail", "This is not a real command or a wrong permission level"));
        });
    }
}

function ai (Client, msg) {
    Client.db.getSettings(msg.guild.id, "ai").then((value) => {
        value = value == "true" || value == "1";
        let val = +!value;
        Client.db.setSettings(msg.guild.id, "ai", val).then(() => {
            let message;
            if (val) {
                message = Client.createEmbed("succes", "Bot will respond to messages that include it's name (AI BETA)");
            } else {
                message = Client.createEmbed("succes", "Bot won't respond to messages that includes it's name anymore.");
            }
            Client.send(msg, message);
        });
    });
}

function support (Client, msg) {
    Client.db.getSettings(msg.guild.id, "support").then((value) => {
        value = value == "true" || value == "1";
        let val = +!value;
        Client.db.setSettings(msg.guild.id, "support", val).then(() => {
            let message;
            if (val) {
                message = Client.createEmbed("succes", "Bot admin support enabled");
            } else {
                message = Client.createEmbed("succes", "Bot admin support disabled");
            }
            Client.send(msg, message);
        });
    });
}

function prefix (Client, msg) {
    if (msg.params.length >= 2) {
        Client.db.setSettings(msg.guild.id, "prefix", msg.params[1]).then(() => {
            let message = Client.createEmbed("info", "Prefix set to `" + msg.params[1] + "`");
            Client.send(msg, message);
        });
    }
}

function botupdates (Client, msg) {
    Client.db.getSettings(msg.guild.id, "botupdates").then((value) => {
        value = value == "true" || value == "1";
        let val = +!value;
        Client.db.setSettings(msg.guild.id, "botupdates", val).then(() => {
            let message;
            if (val) {
                message = Client.createEmbed("succes", "Bot updates are back on.");
            } else {
                message = Client.createEmbed("succes", "There will be no bot updates anymore.");
            }
            Client.send(msg, message);
        });
    });
}

function welcome (Client, msg) {
    msg.params.shift();
    let welcomeMessage = msg.params.join(" ");
    Client.db.setSettings(msg.guild.id, "welcome", welcomeMessage).then(() => {
        if (welcomeMessage) {
            Client.send(msg, Client.createEmbed("succes", "Welcome message set to:")).then(() => {
                Client.welcome(Client, msg.member);
            });
        } else {
            Client.send(msg, Client.createEmbed("succes", "Welcome message removed."));
        }
    });
}

function welcomeChannel (Client, msg) {
    Client.db.setSettings(msg.guild.id, "welcomeChannel", msg.channel.id).then(() => {
        Client.send(msg, Client.createEmbed("succes", "Welcome Channel set")).then(() => {
            Client.welcome(Client, msg.member);
        });
    });
}
