const fs = require('fs');
const db = require("../src/database");
const serverSettings = require("../serverSettings.json");

module.exports = class Servers{
    constructor(bot, guilds){
        this.bot = bot;
        this.songQueue = {};
        this.collectors = {};
        this.adminRole = {};

        this.getUsers();
    }

    getUsers(){
        try {
            this.users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
        } catch(e) {
            this.users = {};
        }
    }

    saveUsers(_callback){
        fs.writeFile(__dirname + "/../data/users.json", JSON.stringify(this.users), "utf8", function(err){
            (typeof _callback === 'function') ? _callback(err) : null;
        });
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
            return this.isOwner(msg) || msg.author.id == serverSettings.botOwner || this.getRoles(msg).includes(adminRole);
	}

    getPermissionLevel(msg, adminRole){
        if(msg.author.id == serverSettings.botOwner){
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

	getMentionRole(msg){
		if (msg.mentions.roles.first()){
			return msg.mentions.roles.first();
		} else {
			return false;
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
