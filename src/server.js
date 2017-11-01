const fs = require('fs');

module.exports = class Servers{
    constructor(bot, serverSettings){
        this.bot = bot;
        this.serverSettings = serverSettings;
        this.songQueue = {};
        this.collectors = {};

        this.getSettings();
        this.getUsers();
        this.getStats();
    }

    getSettings(){
        this.settings = JSON.parse(fs.readFileSync('./data/settings.json', 'utf8'));
        if(this.settings == undefined){
            this.settings = {};
        }
    }

    getUsers(){
        this.users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
        if(this.users == undefined){
            this.users = {};
        }
    }

    getStats(){
        this.stats = JSON.parse(fs.readFileSync("./data/stats.json", "utf8"));
        if(this.stats == undefined){
            this.users = {};
        }
    }

    saveSettings(_callback){
        fs.writeFile(__dirname + "/../data/settings.json", JSON.stringify(this.settings), "utf8", function(err){
            (typeof _callback === 'function') ? _callback(err) : null;
        });
    }

    saveUsers(_callback){
        fs.writeFile(__dirname + "/../data/users.json", JSON.stringify(this.users), "utf8", function(err){
            (typeof _callback === 'function') ? _callback(err) : null;
        });
    }

    saveStats(_callback){
        fs.writeFile(__dirname + "/../data/stats.json", JSON.stringify(this.stats), "utf8", function(err){
            (typeof _callback === 'function') ? _callback(err) : null;
        });
    }

    getOwner(msg){
        return this.bot.guilds.get(msg.guild.id).ownerID;
    }

    getRoles(msg){
		return msg.member.roles.keyArray();
	}

	isOwner(msg){
		return msg.author.id == this.getOwner(msg);
	}

	isAdmin(msg){
		return this.isOwner(msg) || msg.author.id == this.serverSettings.botOwner || this.getRoles(msg).includes(this.settings[msg.guild.id].adminRole);
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
			return msg.mentions.roles.first().id;
		} else {
			return false;
		}
	}

	getUsername(userID){
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
