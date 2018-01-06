const fs = require('fs');

module.exports = class Servers{
    constructor(Client){
        this.Client = Client;
        this.bot = Client.bot;
    }

    getOwner(msg){
        let guild = msg.guild.id;
        return this.bot.guilds.get(guild).ownerID;
    }

    getRoles(msg){
		return msg.member.roles.keyArray();
	}

	isOwner(msg){
		return msg.author.id == this.getOwner(msg);
	}

	isAdmin(msg, adminRole){
            return this.isOwner(msg) || msg.author.id == this.Client.serverSettings.botOwner || this.getRoles(msg).includes(adminRole);
	}

    getPermissionLevel(msg, adminRole, support){
        if(msg.author.id == this.Client.serverSettings.botOwner && support == true){
            return 4;
        } else if(this.isOwner(msg)){
            return 3;
        } else if(this.isAdmin(msg, adminRole)){
            return 2;
        } else {
            return 1;
        }
    }

	getMention(msg){
		if (msg.mentions.users.first()){
			return msg.mentions.users.first().id;
		} else {
			return false;
		}
	}

    extractID(msg, pos){
        if(msg.mentions.users.first()){
            console.log("test");
            return msg.mentions.users.first().id;
        } else {
            return msg.params[pos];
        }
    }

	getMentionRole(msg){
		if (msg.mentions.roles.first()){
			return msg.mentions.roles.first();
		} else {
            if(msg.content.includes("<@&")){
                console.log(msg.content.split("<@&")[1].split(">")[0])
                return {id: msg.content.split("<@&")[1].split(">")[0]};

            } else {
                return false;
            }
		}
	}

    extractRoleID(msg, pos){
        if(msg.mentions.roles.first()){
            return msg.mentions.roles.first().id;
        } else {
            return msg.params[pos];
        }
    }

    extractRole(msg, pos){
        if(msg.mentions.roles.first()){
            return msg.mentions.roles.first();
        } else {
            return msg.guild.roles.get(msg.params[pos]);
        }
    }

	getUsername(msg, userID){
		return this.bot.users.get(userID).username;
	}

	getNick(msg, userID){
		return this.bot.guilds.get(msg.guild.id).members.get(userID).nickname;
	}

	isVoiceChannel(msg, channelID){
		if(msg.guild.channels.keyArray().includes(channelID)){
			return msg.guild.channels.get(channelID).type == "voice";
		}
	}
}
