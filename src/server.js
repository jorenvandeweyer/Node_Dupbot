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
        try {
            this.settings = JSON.parse(fs.readFileSync('./data/settings.json', 'utf8'));
        } catch(e) {
            this.settings = {};
        }
    }

    getUsers(){
        try {
            this.users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
        } catch(e) {
            this.users = {};
        }
    }

    getStats(){
        try {
            this.stats = JSON.parse(fs.readFileSync("./data/stats.json", "utf8"));
        } catch(e) {
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

    getPermissionLevel(msg){
        console.log(msg.author.id);
        console.log(this.botOwner);
        if(msg.author.id == this.serverSettings.botOwner){
            return 4;
        } else if(this.isOwner(msg)){
            return 3;
        } else if(this.isAdmin(msg)){
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
			return msg.mentions.roles.first().id;
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
