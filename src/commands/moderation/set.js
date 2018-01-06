module.exports = {
    name: "set",
    usage: "<warntime, log, iamrole, maxiamroles, admin, deleteCommands, perm, music, voice, dj, prefix> <opt>",
    defaultPermission: 3,
    failPermission: "You can't edit the settings",
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        if(msg.params.length >= 1){
    		switch(msg.params[0]){
    			case "log":
    				Client.db.setSettings(msg.guild.id, "logchannel", msg.channel.id, () => {
    					message = Client.createEmbed("succes", "Logchannel set.");
    					Client.send(msg, message);
    				});
    				break;
    			case "warntime":
    				if(msg.params.length >= 2){
    					Client.db.setSettings(msg.guild.id, "warntime", msg.params[1], () => {
    						message = Client.createEmbed("succes", "Warntime set to " + msg.params[1] + " hours.");
    						Client.send(msg, message);
    					});
    				} else {
    					message = Client.createEmbed("info", "!set warntime <hours>");
    					Client.send(msg, message);
    				}
    				break;
    			case "iamrole":
    				if(msg.params.length >= 2){
    					let role = Client.serverManager.extractRole(msg);
    					let roles = [];
    					Client.db.getSettings(msg.guild.id, "iam_roles", (value) => {
    						if(value){
    							roles = value.split(",");

    							let index = roles.indexOf(role.id.toString());
    							if( index >= 0){
    								roles.splice(index, 2);
    							} else {
    								roles.push(role.id);
    								roles.push(role.name);
    							}
    						} else {
    							roles = [role.id, role.name];
    						}

    						Client.db.setSettings(msg.guild.id, "iam_roles", roles.join(","), () => {
    							let allRoles = [];
    							for (let i = 1; i < roles.length; i+=2){
    								allRoles.push(roles[i]);
    							}

    							let message = Client.createEmbed("info", allRoles.join(", "), "All assignable roles:");
    							Client.send(msg, message);
    						});

    					});

    				} else {
    					message = Client.createEmbed("info", "!set role <@Role>");
    					Client.send(msg, message);
    				}
    				break;
                case "maxiamroles":
                    if(msg.params.length >= 2){
                        Client.db.setSettings(msg.guild.id, "max_iam_roles", parseInt(msg.params[1]), () => {
                            let message = Client.createEmbed("info", "Max assignable roles set to: " + parseInt(msg.params[1]));
                            Client.send(msg, message);
                        });
                    }
                    break;
    			case "admin":
    				if(msg.params.length >= 2){
    					roleID = Client.serverManager.extractRoleID(msg, 1);
    					if(roleID){
    						Client.db.setSettings(msg.guild.id, "adminrole", roleID, () => {
    							message = Client.createEmbed("succes", "Adminrole set to <@&" + roleID + ">");
    							Client.send(msg, message);
    						});
    					}
    				} else {
    					message = Client.createEmbed("info", "!set admin @Role");
    					Client.send(msg, message);
    				}
    				break;
    			case "voice":
    				let voiceChannel = msg.member.voiceChannelID;
    				if(voiceChannel){
    					Client.db.setSettings(msg.guild.id, "voiceChannel", voiceChannel, () => {
    						message = Client.createEmbed("succes", "Voice channel set to <#" + voiceChannel + ">");
    						Client.send(msg, message);
    					});
    				} else {
    					message = Client.createEmbed("info", "Go in a voice channel before using this command.");
    					Client.send(msg, message);
    				}
    				break;
    			case "music":
    				Client.db.setSettings(msg.guild.id, "musicChannel", msg.channel.id, () => {
    					message = Client.createEmbed("succes", "Music channel set.");
    					Client.send(msg, message);
    				});
    				break;
                case "dj":
                    if(msg.params.length >= 2){
                        roleID = Client.serverManager.extractRoleID(msg, 1);
                        if(roleID){
                            Client.db.setSettings(msg.guild.id, "djrole", roleID, () => {
                                message = Client.createEmbed("succes", "DJ role set to <@&" + roleID + ">");
                                Client.send(msg, message);
                            });
                        }
                    }
                    break;
    			case "deleteCommands":
    				Client.db.getSettings(msg.guild.id, "deleteCommands", (value) => {
                        value = value == "true" || value == "1";
                        let val = +!value;
    					Client.db.setSettings(msg.guild.id, "deleteCommands", val, () => {
    						if(val){
    							message = Client.createEmbed("succes", "Commands will be deleted.");
    						} else {
    							message = Client.createEmbed("succes", "Commands won't be deleted anymore.");
    						}
    						Client.send(msg, message);
    					});
    				});
    				break;
    			case "perm":
    				if(msg.params.length >= 3){
    					let command = msg.params[1];
    					let value = msg.params[2];

    					Client.db.setPermissions(msg.guild.id, command, value);
                        let message = Client.createEmbed("info", "Permission for `" + command + "` set to `" + value +"`");
                        Client.send(msg, message);
    				}
    				break;
                case "ai":
                    Client.db.getSettings(msg.guild.id, "ai", (value) => {
                        value = value == "true" || value == "1";
                        let val = +!value;
                        Client.db.setSettings(msg.guild.id, "ai", val, () => {
                            if(val){
                                message = Client.createEmbed("succes", "You enabled the AI(beta) function");
                            } else {
                                message = Client.createEmbed("succes", "You disabled the AI function, Cleverbot will take over :)");
                            }
                            Client.send(msg, message);
                        });
                    });
                    break;
                case "talk":
                    Client.db.getSettings(msg.guild.id, "talk", (value) => {
                        value = value == "true" || value == "1";
                        let val = +!value;
                        Client.db.setSettings(msg.guild.id, "talk", val, () => {
                            if(val){
                                message = Client.createEmbed("succes", "Bot will respond to messages that include it's name");
                            } else {
                                message = Client.createEmbed("succes", "Bot won't respond to messages that includes it's name anymore.")
                            }
                            Client.send(msg, message);
                        });
                    });
                    break;
                case "support":
                    Client.db.getSettings(msg.guild.id, "support", (value) => {
                        value = value == "true" || value == "1";
                        let val = +!value;
                        Client.db.setSettings(msg.guild.id, "support", val, () => {
                            if(val){
                                message = Client.createEmbed("succes", "Bot admin support enabled");
                            } else {
                                message = Client.createEmbed("succes", "Bot admin support disabled");
                            }
                            Client.send(msg, message);
                        });
                    });
                    break;
                case "prefix":
                    if(msg.params.length >= 2){
                        Client.db.setSettings(msg.guild.id, "prefix", msg.params[1]);
                        let message = Client.createEmbed("info", "Prefix set to `" + msg.params[1] + "`");
                        Client.send(msg, message);
                    }
                    break;
                case "botupdates":
                    Client.db.getSettings(msg.guild.id, "botupdates", (value) => {
                        value = value == "true" || value == "1";
                        let val = +!value;
                        Client.db.setSettings(msg.guild.id, "botupdates", val, () => {
                            if(val){
                                message = Client.createEmbed("succes", "Bot updates are back on.");
                            } else {
                                message = Client.createEmbed("succes", "There will be no bot updates anymore.");
                            }
                            Client.send(msg, message);
                        })
                    });
                    break;
                default:
    				message = Client.createEmbed("info", msg.client.commands.get("set").description);
    				Client.send(msg, message);
    				break;
    		}
    	} else {
    		message = Client.createEmbed("info", msg.client.commands.get("set").description);
    		Client.send(msg, message);
    	}
    }
};
