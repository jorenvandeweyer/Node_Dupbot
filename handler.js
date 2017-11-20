const https = require('https');
const fs = require('fs');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const google = require('googleapis');

const Servers = require("./src/server");
const db = require("./src/database");
const cah = require("./src/cahgamehandler");
const ai = require("./src/ai");
const cleverbot = require("./src/cleverbot");
const serverSettings = require("./serverSettings.json");
var bot, listener, youtube, serverManager;

/***************/
/****Exports****/
/***************/

function recieveMessage(msg){
	isCommand(msg, () => {
		if(msg.isCommand){
			command.call(this, msg);
		}else if(msg.interact){
			db.getSettings(msg.guild.id, "ai", (value) => {
				if(parseInt(value)){
					ai.get(this, msg);
				} else {
					cleverbot.get(this, msg);
				}
			});
		}
	});
}

function command(msg){
	let command = bot.commands.get(msg.command);
	if(!command) return;

	if(command.guildOnly && msg.channel.type !== "text"){
		return msg.reply("No no no! Don't use this in DM's :scream:");
	}

	if (command.args && !msg.params.length) {
		let reply = `You are using this command wrong :expressionless:, ${msg.author}!`;

		if (command.usage) {
			reply += `\nTry this: \`${serverManager.prefix}${command.name} ${command.usage}\``;
		} else {
			reply += `\nTry this: \`${serverManager.prefix}${command.name}\``;
		}

		return msg.channel.send(reply);
	}

	try {
		if(!command.guildOnly && msg.channel.type !== "text"){
			command.execute(this, msg);
		} else {
			db.getPermissions(msg.guild.id, msg.command, (value) => {
				// console.log("------ " + msg.permissionLevel + "/" + value + " : " + msg.command);
				if (value == undefined || value == 0) return;

				if(msg.permissionLevel >= value){
					command.execute(this, msg);
				} else {
					if(command.failPermission !== undefined){
						let message = createEmbed("info", command.failPermission);
						send(msg, message);
					}
				}
			});
		}
	}
	catch (error) {
		console.error(error);
		msg.reply(":bomb: :boom: That didn't work out :neutral_face:");
	}
};

function isCommand(msg, _callback){
	if(msg.author.id != bot.user.id && msg.content[0] == serverManager.prefix){
		msg.params = msg.content.slice(1).split(" ");
		msg.command = msg.params.shift().toLowerCase();
		msg.isCommand = true;
		if(msg.channel.type == "text"){
			db.getSettings(msg.guild.id, "adminrole", (role) => {
				msg.permissionLevel = serverManager.getPermissionLevel(msg, role);
				_callback();
			});
		} else {
			_callback();
		}
	} else {
		if(msg.content.toLowerCase().includes(msg.client.user.username.toLowerCase())) {
			msg.interact = true;

			let words = msg.content.split(" ");

			let index = words.map(y => y.toLowerCase()).indexOf(msg.client.user.username.toLowerCase());
			if(index == 0 || index == words.length - 1){
				words.splice(index, 1);
			}
			msg.input_ai = words.join(" ");
			db.getSettings(msg.guild.id, "adminrole", (role) => {
				msg.permissionLevel = serverManager.getPermissionLevel(msg, role);
				_callback();
			});
		} else {
			_callback();
		}
	}
}

function setup(b, l){
	console.log("[*]initiating setup");
	bot = b;
	listener = l;

	youtube = google.youtube({
		version: 'v3',
		auth: serverSettings.youtubeAuth
	});

	serverManager = new Servers(b, bot.guilds);

	db.setup(this, bot.guilds);

	for(key of bot.guilds){
		console.log("[*]connected to server: " + key);
	}

	if(bot.token == serverSettings.token){
		serverManager.prefix = serverSettings.prefix;
	} else {
		serverManager.prefix = serverSettings.prefix_dev;
	}

	bot.on("guildCreate", (guild) => {
		db.add(this, guild.id);
	});

	let commandFiles = fs.readdirSync('./src/commands');

	for (let file of commandFiles) {
		let command = require(`./src/commands/${file}`);
		bot.commands.set(command.name, command);
	}

	console.log("[+]setup ready");
}

/**************/
/*****DATA*****/
/**************/

function log(msg, userID, sort, reason, time){
	let mod = msg.author.id
	let username = userID;
	let presentNick = userID;
	try{
		let username = serverManager.getUsername(msg, userID);
		let presentNick = serverManager.getNick(msg, userID);
	} catch(e){

	}
	let date = new Date().getTime();
	let message = "";

	if(serverManager.users[msg.guild.id] == undefined){
		serverManager.users[msg.guild.id] = {};
	}

	if(serverManager.users[msg.guild.id][userID] == undefined){
		serverManager.users[msg.guild.id][userID] = {
			id: userID,
			name: username,
			nick: presentNick,
			isBanned: false,
			cooldownTime: 0,
			activeWarnings: 0,
			warnings: {},
			kicks: {},
			bans: {},
			nicks: {},
			unbans: {},
			notes: {}
		}
	}



	let file = serverManager.users[msg.guild.id][userID];

	switch(sort){
		case "warn":
			file.warnings[date] = {
				date: date,
				reason: reason,
				mod: mod
			}
			title = "Warning";
			message += "**Mod**: <@" + mod + ">\n**User**: " + username + "\n**Reason**: " + reason;
			break;

		case "kick":
			file.kicks[date] = {
				date: date,
				reason: reason,
				mod: mod
			}
			title = "Kick";
			message += "**Mod**: <@" + mod + ">\n**Kicked**: " + username + "\n**Reason**: " + reason;

			break;

		case "ban":
			file.bans[date] = {
				date: date,
				reason: reason,
				sort: "ban",
				mod: mod
			}
			if(serverManager.users[msg.guild.id].bans == undefined) serverManager.users[msg.guild.id].bans = {};
			serverManager.users[msg.guild.id].bans[userID] = username;
			title = "Ban";
			message += "**Mod**: <@" + mod + ">\n**Banned**: " + username + "\n**Reason**: " + reason;
			break;

		case "tempban":
			file.bans[date] = {
				date: date,
				reason: reason,
				sort: "tempban",
				time: time,
				mod: mod
			}
			title = "tempban";
			message += "**Mod**: <@" + mod + ">\n**Tempbanned**: " + username + "\n**Days**:" + time + "days \n**Reason**: " + reason;
			break;

		case "unban":
			file.unbans[date] = {
				date: date,
				mod: mod
			}
			title = "Unban";
			message += "**Mod**: <@" + mod + ">\n**Unbanned**: " + username;
			delete serverManager.users[msg.guild.id].bans[userID];
			break;

		case "note":
			file.notes[date] = {
				date: date,
				note: reason,
				mod: mod
			}
			title = "Note";
			message += "**Mod**: <@" + mod + ">\n**Note about**: " + presentNick + "\n**Content**: " + reason;
			break;
	}
	message = createEmbed(sort, message, title);

	db.getSettings(msg.guild.id, "logchannel", (channelId) => {
		if(channelId){
			sendChannel(msg, channelId, message);
		}
	});

	if(file.nick != presentNick){
		file.nicks[date] = {
			date: date,
			nick: presentNick
		}
		file.nick = presentNick;
	}

	serverManager.saveUsers();
}

function dateToString(date){
	return new Date(date).toISOString().replace(/[A-z]/g, " ");
}

function createEmbed(colorName, info, title, fields, footer){
	switch(colorName){
		case "info":
			color = 3447003;
			break;

		case "ban":
			color = 16007746;
			break;

		case "kick":
			color = 16028993;
			break;

		case "warn":
			color = 15908236;
			break;

		case "unban":
			color = 4193355;
			break;

		case "succes":
			color = 4193355;
			break;

		case "fail":
			color = 15908236;
			break;

		case "purple":
			color = 0x5a00b1;
			break;

		default:
			color = 3447003;
			break;
	}

	return {
		embed:{
			color: color,
			description: info,
			title: title,
			fields: fields,
			footer: footer
		}
	};
}

function convertYTDuration(duration) {
    let a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration;
}

function convertTimeToString(seconds) {
	seconds = Number(seconds);
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor(seconds % 3600 / 60);
	seconds = Math.floor(seconds % 3600 % 60);
	return ((hours > 0 ? hours + ":" + (minutes < 10 ? "0" : "") : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

function splitter(str, l){
    let strs = [];
    while(str.length > l){
        let pos = str.substring(0, l).lastIndexOf(' ');
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        let i = str.indexOf(' ', pos)+1;
        if(i < pos || i > pos+l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
}

function getServerManager(){
	return serverManager;
}

function getListener(){
	return listener;
}

function getBot(){
	return bot;
}

/***************/
/***FUNCTIONS***/
/***************/

function send(msg, message, _callback){
	msg.channel.send(message).then((message) => {
		if (typeof _callback === "function"){
			_callback(message);
		}
	});
}

function sendChannel(msg, channelId, message, _callback){
	msg.guild.channels.get(channelId).send(message).then((message) => {
		if (typeof _callback === "function"){
			_callback(message);
		}
	});
}

function kick(msg, userID, reason){
	message = createEmbed("kick", "<@" + userID + "> You have been kicked :wave:");
	send(msg, message);

	if(reason){
		bot.users.get(userID).send(reason);
	} else {
		bot.users.get(userID).send("You have been kicked");
	}

	msg.guild.members.get(userID).kick(reason);
}

function ban(msg, userID, reason, time){
	message = createEmbed("ban", "<@"+ userID + "> You have been banned :hammer:");
	send(msg, message);

	bot.users.get(userID).send(reason);

	msg.guild.ban(userID, {
		days: 7,
		reason: reason
	});
}

function unban(msg, userID){
	message = createEmbed("unban", "Unbanned :ok_hand:")
	send(msg, message);

	msg.guild.unban(userID);
}

function silence(msg, userID){
	message = createEmbed("warn", "<@" + userID + "> Muted :point_up_2:")
	send(msg, message);

	msg.guild.members.get(userID).setMute(true);
}

function unSilence(msg, userID){
	message = createEmbed("unban", "<@" + userID + "> Unmuted :ok_hand:");
	send(msg, message);

	msg.guild.members.get(userID).setMute(false);
}

function warn(msg, userID, reason){
	let warnings = {};
	try{
		warnings = serverManager.users[msg.guild.id][userID].warnings;
	} catch(e){}

	db.getSettings(msg.guild.id, "warntime", (value) => {
		let warntime = 24;
		if(value){
			warntime = parseInt(value);
		}
		let today = new Date().getTime();
		let active = 0;
		for (key in warnings){
			date = warnings[key].date;
			if(today - date < warntime* 60 * 60 * 1000){
				active++;
			}
		}

		message = createEmbed("warn", reason);

		send(msg, message);

		if (active >= 3){
			messageKick = createEmbed("kick", "You have been automatically kicked after 3 (active) warnings.");
			kick(msg, userID, messageKick);
			log(msg, userID, "kick", "3 warnings");
		}
	});
}

function see(msg, userID){
	if(!userHasFile(msg, userID)) return;
	let user = serverManager.users[msg.guild.id][msg.author.id];
	let warnings = "";
	let kicks = "";
	let bans = "";
	let unbans = ""
	let nicks = "";

	for(key in user.warnings){
		warnings += dateToString(user.warnings[key].date) + " - <@" + user.warnings[key].mod + "> - " + user.warnings[key].reason + "\n";
	}
	if(warnings == "") warnings = "-";
	for(key in user.kicks){
		kicks += dateToString(user.kicks[key].date) + " - <@" + user.kicks[key].mod + "> - " + user.kicks[key].reason + "\n";
	}
	if(kicks == "") kicks = "-";
	for(key in user.bans){
		bans += dateToString(user.bans[key].date) + " - <@" + user.bans[key].mod + "> - " + user.bans[key].reason + "\n";
	}
	if(bans == "") bans = "-";
	for(key in user.unbans){
		unbans += dateToString(user.unbans[key].date) + " - <@" + user.unbans[key].mod + "> - " + user.unbans[key].reason + "\n";
	}
	if(unbans == "") unbans = "-";
	for(key in user.nicks){
		nicks += dateToString(user.nicks[key].date) + " - " + user.nicks[key].nick + "\n";
	}
	if(nicks == "") nicks = "-";

	let fields = [
		{
			name: "Warnings:",
			value: warnings
		},{
			name: "Kicks:",
			value: kicks
		},{
			name: "Bans:",
			value: bans
		},{
			name: "Unbans:",
			value: unbans
		},{
			name: "Previous nicks:",
			value: nicks
		}
	];
	message = createEmbed("info", "All events related to " + serverManager.getUsername(msg, userID), serverManager.getUsername(msg, userID), fields);
	db.getSettings(msg.guild.id, "logchannel", (channelId) => {
		if(channelId){
			sendChannel(msg, channelId, message)
		} else {
			send(msg, message);
		}
	});
}

function userHasFile(msg, userID){
	if(serverManager.users[msg.guild.id] == undefined) return false;

	let user = serverManager.users[msg.guild.id][userID];

	if(user == undefined){
		message = createEmbed("info", "User has no file!");
		db.getSettings(msg.guild.id, "logchannel", (channelId) => {
			if(channelId){
				sendChannel(msg, channelId, message);
			} else {
				send(channelId, message);
			}
		})
		return false;
	}
	return true;
}

function broadcastNextSpeed(msg, market){
	let speeds = [];
	let str = "";
	https.get("https://twspeeds.com/callhandler.php?action=discord&market=" + market, (res) => {
		res.on('data', (chunk) => {
			str += chunk;
		});
		res.on('end', function(){
			speeds = JSON.parse(str);

			if(speeds.length != 0){
				message = "```Markdown\r\n"
				 + "Next speedround:\r\n"
				 + speeds[0].round + "\r\n"
				 + "Start: " + speeds[0].start + "\r\n"
				 + "End: " + speeds[0].end + "\r\n"
				 + "```" + "\r\n"
				 + "https://www.tribalwars.nl/page/speed/rounds/future";

			 	message = createEmbed("info", message);
				send(msg, message);
			}
		})
	});
}

function broadcastSpeed(msg, market){
	let speeds = [];
	let str = "";
	https.get("https://twspeeds.com/callhandler.php?action=discord&market=" + market, (res) => {
		res.on('data', (chunk) => {
			str += chunk;
		});
		res.on('end', function(){
			speeds = JSON.parse(str);

			if(speeds.length != 0){

				message = "```Markdown\r\n"
				 + "Next speedrounds:\r\n\r\n";


				speeds.forEach(function(speed){
					message += speed.round + "\r\n"
					 + "Start: " + speed.start + "\r\n"
					 + "End: " + speed.end + "\r\n\r\n";
				})

				message += "```" + "\r\n"
				 + "https://www.tribalwars.nl/page/speed/rounds/future";

				message = createEmbed("info", message);
				send(msg, message);
			} else {
				send(msg, createEmbed("info", speedCommand.help));
			}
		});
	});
}

function deleteMessage(msg, messageID){
	msg.channel.messages.get(messageID).delete();
}

function editMessage(msg, messageID, content){
	msg.channel.messages.get(messageID).edit(content);
}

function addToRole(msg, userID, roleID){
	msg.guild.members.get(userID).addRole(roleID);
}

function removeFromRole(msg, userID, roleID){
	msg.guild.members.get(userID).removeRole(roleID);
}

function joinVoiceChannel(msg, _callback){
	db.getSettings(msg.guild.id, "voiceChannel", (value) => {
		if(value){
			msg.guild.channels.get(value).join().then(con => _callback(con));
		} else {
			msg.member.voiceChannel.join().then(con => _callback(con));
		}
	});
}

function leaveVoiceChannel(msg){
	msg.guild.voiceConnection.channel.leave()
	// db.getSettings(msg.guild.id, "voiceChannel", (value) => {
	// 	if(value){
	// 		msg.guild.channels.get(value).leave();
	// 	}
	// });
}

function playSong(msg){
	let connection = bot.voiceConnections.get(msg.guild.id);
	let video = serverManager.songQueue[msg.guild.id][0];
	let videoID;

	if(video.type == "song"){
		videoID = video.videoID;

		db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
			if(channelId){
				sendChannel(msg, channelId, {
					embed: {
						color: 0x5a00b1,
						title: "=-=-=-=-=-=-= Song =-=-=-=-=-=-=",
						fields: [
							{
								name: "Now Streaming",
								value: video.title
							},
							{
								name: "Duration",
								value: video.duration
							},
							{
								name: "Channel",
								value: video.channel
							}
						],
						footer: {
							icon_url: "https://cdn.discordapp.com/avatars/" + video.userID + "/" + video.avatar + ".webp?size=1024",
							text: "Requested by " + video.username
						},
						thumbnail: {
							url: video.thumbnail
						}
					}
				}, addSongFeedback);
			}
		});
	} else if(video.type == "playlist"){
		let shuffleValue = "off";
		video.current = 0;

		if(video.shuffle){
			shuffleValue = "on";
			video.current = Math.floor(Math.random()*video.songs.length);
		}

		videoID = video.songs[video.current].videoID;

		YouTubeVideo(video.songs[video.current].videoID, function(obj){
			db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
				if(channelId){
					sendChannel(msg, channelId, {
						embed: {
							color: 0x5a00b1,
							title: "=-=-=-=-=-=-= Playlist =-=-=-=-=-=-=",
							fields: [
								{
									name: video.title,
									value: video.songs.length + " songs left in playlist || shuffle " + shuffleValue
								},
								{
									name: "Now Streaming",
									value: obj.title
								},
								{
									name: "Duration",
									value: obj.duration
								},
								{
									name: "Channel",
									value: obj.channel
								}
							],
							footer: {
								icon_url: "https://cdn.discordapp.com/avatars/" + video.userID + "/" + video.avatar + ".webp?size=1024",
								text: "Requested by " + video.username
							},
							thumbnail: {
								url: obj.thumbnail
							}
						}
					}, addSongFeedback);
				}
			});
		});
	}

   	let stream = ytdl('https://www.youtube.com/watch?v=' + videoID, {  });
   	let dispatcher = connection.playStream(stream, streamOptions);

	dispatcher.on('end', () => {
		// if(serverManager.stats[msg.guild.id] == undefined) {
		// 	serverManager.stats[msg.guild.id] = {};
		// 	serverManager.stats[msg.guild.id].songsPlayed = 0;
		// }
		// serverManager.stats[msg.guild.id].songsPlayed ++;
		// serverManager.saveStats();
		if(serverManager.collectors[msg.guild.id]){
			serverManager.collectors[msg.guild.id].stop();
		}
		if(video.type == "song"){
			serverManager.songQueue[msg.guild.id].shift();
		} else if (video.type == "playlist"){
			if(video.songs.length == 1){
				serverManager.songQueue[msg.guild.id].shift();
			} else {
				video.songs.splice(video.current, 1);
			}
		} else {
			serverManager.songQueue[msg.guild.id].shift()
		}

		if(serverManager.songQueue[msg.guild.id].length > 0){
			setTimeout(function(){
				playSong(msg);
			},1000);
		} else {
			leaveVoiceChannel(msg);
			db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
				if(channelId){
					sendChannel(msg, channelId, createEmbed("info", "Queue finished"));
				}
			});
		}
	});
}

function addSongFeedback(msg){
	msg.react("❌");
	//msg.react("✅");
	const collector = msg.createReactionCollector(
	 (reaction, user) => reaction.emoji.name == "❌" || reaction.emoji.name == "✅",
	 { time: 60 * 60 * 1000 }
	);
	serverManager.collectors[msg.guild.id] = collector;

	collector.on('collect', r => {
		if(r.emoji.name == "❌" && r.users.size > bot.voiceConnections.get(msg.guild.id).channel.members.size / 2){
			bot.voiceConnections.get(msg.guild.id).dispatcher.end();
		}
	});
}

function nextSong(msg){
	if(msg.permissionLevel < 2){
		if(serverManager.songQueue[msg.guild.id].length > 0){
			if(serverManager.songQueue[msg.guild.id][0].userID != msg.author.id){
				return;
			}
		} else {
			return;
		}
	}
	if(msg.params.length > 0){
		if(msg.params[0] == "playlist"){
			serverManager.songQueue[msg.guild.id][0].type = "skipPlaylist";
		}
	}

	bot.voiceConnections.get(msg.guild.id).dispatcher.end();
}

function addSongToQueue(msg, id){
	YouTubeVideo(id, function(video){
		let song = {
			type: "song",
			userID: msg.author.id,
			username: msg.author.username,
			avatar: msg.author.avatarURL,
			videoID: video.id,
			title: video.title,
			channel: video.channel,
			duration: video.duration,
			seconds: video.seconds,
			thumbnail: video.thumbnail
		}
		if(serverManager.songQueue[msg.guild.id] == undefined) serverManager.songQueue[msg.guild.id] = [];
		serverManager.songQueue[msg.guild.id].push(song);

		let message = createEmbed("music");
		message.embed.title = song.title;
		message.embed.footer =  {
			icon_url: song.avatar,
			text: "Queued by " + song.username
		}

		db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
			if(channelId){
				sendChannel(msg, channelId, message);
			} else {
				send(msg, message);
			}
		})

		if(!bot.voiceConnections.get(msg.guild.id)){
			joinVoiceChannel(msg, function(con){
				playSong(msg);
			});
		}

	});
}

function addPlaylistToQueue(msg, id, shuffle){
	YouTubePlaylist({
		id: id,
		maxResults: "50"
	}, function(object){
		playlist = {
			type: "playlist",
			userID: msg.author.id,
			username: msg.author.username,
			avatar: msg.author.avatarURL,
			title: object.title,
			songs: [],
			shuffle: shuffle
		}

		songs = object.items;
		for(i = 0; i < songs.length; i++){
			video = songs[i].snippet;
			try{
				song = {
					videoID: video.resourceId.videoId,
					title: video.title,
					channel: video.channelTitle,
					thumbnail: video.thumbnails.default.url
				}
				playlist.songs.push(song);
			} catch(e){
				console.error(e);
			}

		}

		if(serverManager.songQueue[msg.guild.id] == undefined) serverManager.songQueue[msg.guild.id] = [];
		serverManager.songQueue[msg.guild.id].push(playlist);

		let message = createEmbed("music");
		message.embed.title = playlist.title;
		message.embed.footer = {
			icon_url: playlist.avatar,
			text: "Queued by " + playlist.username
		}

		db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
			if(channelId){
				sendChannel(msg, channelId, message);
			} else {
				send(msg, message);
			}
		});

		if(!bot.voiceConnections.get(msg.guild.id)){
			joinVoiceChannel(msg, function(con){
				playSong(msg);
			});
		}

	});
}

function YouTubeSearch(search, _callback){
	youtube.search.list({
		part: 'snippet',
		q: search,
		maxResults: "1",
		type: "video"
	}, function (err, data) {
		if (err) return console.error(err);

		let videoSearch = data.items[0];
		if(videoSearch == undefined) return;
		_callback({
			id: videoSearch.id.videoId,
			title: videoSearch.snippet.title,
		});

	});
}

function YouTubeVideo(id, _callback){
	youtube.videos.list({
		id: id,
		part: 'snippet,contentDetails'
	}, function (err, data){
		if (err) return console.error(err);

		let videoResult = data.items[0];
		if(videoResult == undefined) return;

		_callback({
			id: videoResult.id,
			duration: convertTimeToString(convertYTDuration(videoResult.contentDetails.duration)),
			seconds: convertYTDuration(videoResult.contentDetails.duration),
			title: videoResult.snippet.title,
			channel: videoResult.snippet.channelTitle,
			thumbnail: videoResult.snippet.thumbnails.medium.url
		});
	})
}

function YouTubePlaylist(object, _callback){
	youtube.playlistItems.list({
		playlistId: object.id,
		pageToken: object.pageToken,
		maxResults: object.maxResults,
		part: 'snippet,contentDetails'
	}, function(err, data){
		if(err) return console.error(err);
		if(data.items[0] == undefined) return;
		if(object.items == undefined) object.items = [];

		object.items.push.apply(object.items, data.items)

		if(data.nextPageToken){
			object.pageToken = data.nextPageToken;
			if(data.pageInfo.totalResults - object.items.length > 50){
				object.maxResults = 50;
			} else {
				object.maxResults = data.pageInfo.totalResults - object.items.length;
			}
			YouTubePlaylist(object, _callback);
		} else {
			youtube.playlists.list({
				id: object.id,
				part: "snippet, contentDetails"
			}, function(err, data2){
				object.title = data2.items[0].snippet.title;
				_callback(object);

			})
		}
	});
}

/****************/
/****COMMANDS****/
/****************/

module.exports = {
	bot: getBot,

	command: command,

	serverManager: getServerManager,
	listener: getListener,

	createEmbed: createEmbed,
	db: db,
	cah: cah,

	clean: clean,
	splitter: splitter,
	log: log,

	recieveMessage: recieveMessage,
	setup: setup,

	send: send,
	sendChannel: sendChannel,
	kick: kick,
	ban: ban,
	unban: unban,
	silence: silence,
	unSilence: unSilence,
	warn: warn,
	see: see,
	userHasFile: userHasFile,
	broadcastNextSpeed: broadcastNextSpeed,
	broadcastSpeed: broadcastSpeed,
	deleteMessage: deleteMessage,
	editMessage: editMessage,
	addToRole: addToRole,
	removeFromRole: removeFromRole,
	joinVoiceChannel: joinVoiceChannel,
	leaveVoiceChannel: leaveVoiceChannel,
	playSong: playSong,
	addSongFeedback: addSongFeedback,
	nextSong: nextSong,
	addSongToQueue: addSongToQueue,
	YouTubeSearch: YouTubeSearch,
	YouTubeVideo: YouTubeVideo,
	YouTubePlaylist: YouTubePlaylist
};
