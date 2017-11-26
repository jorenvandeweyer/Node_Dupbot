module.exports = {
    name: "set",
    description: "!set <warntime, log, role, admin, deleteCommands, perm, music, voice, prefix> <opt>",
    usage: "<warntime, log, role, admin, deleteCommands, perm, music, voice, prefix> <opt>",
    defaultPermission: 3,
    failPermission: "You can't edit the settings",
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if(msg.params.length >= 1){
    		switch(msg.params[0]){
    			case "log":
    				self.db.setSettings(msg.guild.id, "logchannel", msg.channel.id, () => {
    					message = self.createEmbed("succes", "Logchannel set.");
    					self.send(msg, message);
    				});
    				break;
    			case "warntime":
    				if(msg.params.length >= 2){
    					self.db.setSettings(msg.guild.id, "warntime", msg.params[1], () => {
    						message = self.createEmbed("succes", "Warntime set to " + msg.params[1] + " hours.");
    						self.send(msg, message);
    					});
    				} else {
    					message = self.createEmbed("info", "!set warntime <hours>");
    					self.send(msg, message);
    				}
    				break;
    			case "role":
    				if(msg.params.length >= 2){
    					let role = self.serverManager().getMentionRole(msg);
    					let roles = [];
    					self.db.getSettings(msg.guild.id, "iam_roles", (value) => {
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

    						self.db.setSettings(msg.guild.id, "iam_roles", roles.join(","), () => {
    							let allRoles = [];
    							for (let i = 1; i < roles.length; i+=2){
    								allRoles.push(roles[i]);
    							}

    							message = self.createEmbed("info", allRoles.join(", "), "All assignable roles:");
    							self.send(msg, message);
    						});

    					});

    				} else {
    					message = self.createEmbed("info", "!set role <@Role>");
    					self.send(msg, message);
    				}
    				break;
    			case "admin":
    				if(msg.params.length >= 2){
    					roleID = self.serverManager().getMentionRole(msg).id;
    					if(roleID){
    						self.db.setSettings(msg.guild.id, "adminrole", roleID, () => {
    							message = self.createEmbed("succes", "Adminrole set to <@&" + roleID + ">");
    							self.send(msg, message);
    						});
    					}
    				} else {
    					message = self.createEmbed("info", "!set admin @Role");
    					self.send(msg, message);
    				}
    				break;
    			case "voice":
    				let voiceChannel = msg.member.voiceChannelID;
    				if(voiceChannel){
    					self.db.setSettings(msg.guild.id, "voiceChannel", voiceChannel, () => {
    						message = self.createEmbed("succes", "Voice channel set to <#" + voiceChannel + ">");
    						self.send(msg, message);
    					});
    				} else {
    					message = self.createEmbed("info", "Go in a voice channel before using this command.");
    					self.send(msg, message);
    				}
    				break;
    			case "music":
    				self.db.setSettings(msg.guild.id, "musicChannel", msg.channel.id, () => {
    					message = self.createEmbed("succes", "Music channel set.");
    					self.send(msg, message);
    				});
    				break;
    			case "deleteCommands":
    				self.db.getSettings(msg.guild.id, "deleteCommands", (value) => {
    					let val = !parseInt(value);
    					self.db.setSettings(msg.guild.id, "deleteCommands", val, () => {
    						if(val){
    							message = self.createEmbed("succes", "Commands will be deleted.");
    						} else {
    							message = self.createEmbed("succes", "Commands won't be deleted anymore.");
    						}
    						self.send(msg, message);
    					});
    				});
    				break;
    			case "perm":
    				if(msg.params.length >= 3){
    					let command = msg.params[1];
    					let value = msg.params[2];

    					self.db.setPermissions(msg.guild.id, command, value);
                        let message = self.createEmbed("info", "Permission for `" + command + "` set to `" + value +"`");
                        self.send(msg, message);
    				}
    				break;
                case "ai":
                    self.db.getSettings(msg.guild.id, "ai", (value) => {
                        let val = !parseInt(value);
                        self.db.setSettings(msg.guild.id, "ai", val, () => {
                            if(val){
                                message = self.createEmbed("succes", "You enabled the AI(beta) function");
                            } else {
                                message = self.createEmbed("succes", "You disabled the AI function, Cleverbot will take over :)");
                            }
                            self.send(msg, message);
                        });
                    });
                    break;
                case "talk":
                    self.db.getSettings(msg.guild.id, "talk", (value) => {
                        let val = !parseInt(value);
                        self.db.setSettings(msg.guild.id, "talk", val, () => {
                            if(val){
                                message = self.createEmbed("succes", "Bot will respond one messages that include it's name");
                            } else {
                                message = self.createEmbed("succes", "Bot won't respond to messages that includes it's name anymore.")
                            }
                            self.send(msg, message);
                        });
                    });
                    break;
                case "support":
                    self.db.getSettings(msg.guild.id, "support", (value) => {
                        let val = !parseInt(value);
                        self.db.setSettings(msg.guild.id, "support", val, () => {
                            if(val){
                                message = self.createEmbed("succes", "Bot admin support enabled");
                            } else {
                                message = self.createEmbed("succes", "Bot admin support disabled");
                            }
                            self.send(msg, message);
                        });
                    });
                    break;
                case "prefix":
                    if(msg.params.length >= 2){
                        self.db.setSettings(msg.guild.id, "prefix", msg.params[1]);
                        let message = self.createEmbed("info", "Prefix set to `" + msg.params[1] + "`");
                        self.send(msg, message);
                    }
                    break;
                default:
    				message = self.createEmbed("info", msg.client.commands.get("set").description);
    				self.send(msg, message);
    				break;
    		}
    	} else {
    		message = self.createEmbed("info", msg.client.commands.get("set").description);
    		self.send(msg, message);
    	}
    }
};