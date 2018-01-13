module.exports = class Servers{
    constructor(Client){
        this.Client = Client;
        this.bot = Client.bot;
    }

	isAdmin(msg){
        return msg.channel.type === "dm" || (msg.channel.type === "text" && (msg.member.hasPermission("ADMINISTRATOR") || msg.member.id === msg.guild.ownerID));
	}

	isMod(msg, adminRole){
            return this.isAdmin(msg) || msg.member.roles.has(adminRole);
	}

    getPermissionLevel(msg, adminRole, support){
        if(msg.author.id === this.Client.serverSettings.botOwner && support == true){
            return 4;
        } else if(this.isAdmin(msg)){
            return 3;
        } else if(this.isMod(msg, adminRole)){
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
}
