const https = require('https');
const fs = require('fs');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const google = require('googleapis');

const Servers = require("./src/server");
const commands = require("./src/commands/commands");
const db = require("./src/database");
const cah = require("./src/cahgamehandler");

/**************/
/*****VARS*****/
/**************/

var youtube

var bot, serverManager, listener, serverSettings;
/***************/
/****Exports****/
/***************/

exports.recieveMessage = function(msg){
	if(isCommand(msg)){
		commandSwitch(msg, (deleteMsg) => {
			if(deleteMsg){
				try{
					if(serverManager.settings[msg.guild.id].deleteCommands){
						msg.delete();
					}
				} catch(e){
					//nothing
				}
			}
		});
	}
}

function isCommand(msg){
	if(msg.channel.type !== "text") return false;
	//if(serverSettings.ownerOnlyGuilds.indexOf(msg.guild.id.toString()) && msg.author.id !== serverSettings.botOwner) return false;
	if(msg.author.id != bot.user.id && msg.content[0] == serverManager.prefix){
		msg.params = msg.content.slice(1).split(" ");
		msg.command = msg.params.shift();
		msg.permissionLevel = serverManager.getPermissionLevel(msg);
		return true;
	} else {
		return false;;
	}
}

exports.setup = function (b, l, s){
	console.log("[*]initiating setup");
	bot = b;
	listener = l;
	serverSettings = s;
	youtube = google.youtube({
		version: 'v3',
		auth: serverSettings.youtubeAuth
	});
	serverManager = new Servers(b, s);
	db.setup(bot.guilds);
	for(key of bot.guilds){
		console.log("[*]connected to server: " + key);
	}
	if(bot.token == serverSettings.token){
		serverManager.prefix = serverSettings.prefix;
	} else {
		serverManager.prefix = serverSettings.prefix_dev;
	}

	bot.on("guildCreate", (guild) => {
		db.add(guild.id);
	});

	console.log("[+]setup ready");
}

/***************/
/****Commands***/
/***************/

function commandSwitch(msg, _callback){
	try{
		let command;
		switch (msg.command){
			case "eval":
				command = evalCommand;
				break;
			case "evalT":
				command = evalTCommand;
				break;
			case "fetch":
				command = fetchCommand;
				break;
			case "ping":
				command = pingCommand;
				break;
			case "kill":
				command = killCommand;
				break;
			case "getroles":
				command = getrolesCommand;
				break;
			case "say":
				command = sayCommand;
				break;
			case "kick":
				command = kickCommand;
				break;
			case "warn":
				command = warnCommand;
				break;
			case "ban":
				command = banCommand;
				break;
			case "tempban":
				command = tempbanCommand;
				break;
			case "unban":
				command = unbanCommand;
				break;
			case "silence":
				command = silenceCommand;
				break;
			case "unsilence":
				command = unsilenceCommand;
				break;
			case "help":
				command = helpCommand;
				break;
			case "permissions":
				command = permissionsCommand;
				break;
			case "see":
				command = seeCommand;
				break;
			case "speed":
				command = speedCommand;
				break;
			case "reload":
				command = reloadCommand;
				break;
			case "nuke":
				command = nukeCommand;
				break;
			case "set":
				command = setCommand;
				break;
			case "iam":
				command = iamCommand;
				break;
			case "setrole":
				command = setroleCommand;
				break
			case "delrole":
				command = delroleCommand;
				break;
			case "play":
				command = playCommand;
				break;
			case "skip":
				command = skipCommand;
				break;
			case "queue":
				command = queueCommand;
				break;
			case "invite":
				command = inviteCommand;
				break;
			case "cstart":
				command = cahStartCommand;
				break;
			case "cjoin":
				command = cahJoinCommand;
				break;
			case "cleave":
				command = cahLeaveCommand;
				break;
			case "c":
			case "cchoose":
				command = cahChooseCommand;
				break;
			case "creset":
				command = cahResetCommand;
				break;
			case "cscoreboard":
				command = cahScoreboardCommand;
				break;
			// case "join":
			// 	return _callback(joinVoiceChannel(msg, console.log));
			// 	break;
			// case "leave":
			// 	return _callback(leaveVoiceChannel(msg));
			// 	break;
			default:
				//send(msg.userID, "No command");
				return _callback(false);
		}

		db.getPermissions(msg.guild.id, msg.command, (value) => {
			//console.log("------ " + msg.permissionLevel + "/" + value + " : " + msg.command);
			if (value == undefined || value == 0) return _callback(false);

			if (msg.permissionLevel >= value){
				return _callback(!command(msg));
			} else {
				if(commands[msg.command].failPermission != undefined){
					let message = createEmbed("info", commands[msg.command].failPermission);
					send(msg, message);
				}
				return _callback(false);
			}
		});

	} catch (e) {
		console.error(e);
	}
	return _callback(false);
}

/**************/
/*****DATA*****/
/**************/

function log(msg, userID, sort, reason, time){
	var mod = msg.author.id
	var presentNick = serverManager.getNick(msg, userID);
	var username = serverManager.getUsername(msg, userID);

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

	var date = new Date().getTime();

	message ="";

	var file = serverManager.users[msg.guild.id][userID];

	switch(sort){
		case "warn":
			file.warnings[date] = {
				date: date,
				reason: reason,
				mod: mod
			}
			title = "Warning";
			message += "**Mod**: " + mod + "\n**User**: " + username + "\n**Reason**: " + reason;
			break;

		case "kick":
			file.kicks[date] = {
				date: date,
				reason: reason,
				mod: mod
			}
			title = "Kick";
			message += "**Mod**: " + mod + "\n**Kicked**: " + username + "\n**Reason**: " + reason;

			break;

		case "ban":
			file.bans[date] = {
				date: date,
				reason: reason,
				sort: "ban",
				mod: mod
			}
			serverManager.users[msg.guild.id].bans[userID] = userName;
			title = "Ban";
			message += "**Mod**: " + mod + "\n**Banned**: " + username + "\n**Reason**: " + reason;
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
			message += "**Mod**: " + mod + "\n**Tempbanned**: " + username + "\n**Days**:" + time + "days \n**Reason**: " + reason;
			break;

		case "unban":
			file.unbans[date] = {
				date: date,
				mod: mod
			}
			title = "Unban";
			message += "**Mod**: " + mod + "\n**Unbanned**: " + username;
			delete serverManager.users[msg.guild.id].bans[userID];
			break;

		case "note":
			file.notes[date] = {
				date: date,
				note: reason,
				mod: mod
			}
			title = "Note";
			message += "**Mod**: " + mod + "\n**Note about**: " + presentNick + "\n**Content**: " + reason;
			break;
	}
	message = createEmbed(sort, message, title);

	if(serverManager.settings[msg.guild.id].logchannel){
		sendChannel(msg, serverManager.settings[msg.guild.id].logchannel, message);
	}

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
    var a = duration.match(/\d+/g);

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
	var hours = Math.floor(seconds / 3600);
	var minutes = Math.floor(seconds % 3600 / 60);
	var seconds = Math.floor(seconds % 3600 % 60);
	return ((hours > 0 ? hours + ":" + (minutes < 10 ? "0" : "") : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

function splitter(str, l){
    var strs = [];
    while(str.length > l){
        var pos = str.substring(0, l).lastIndexOf(' ');
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        var i = str.indexOf(' ', pos)+1;
        if(i < pos || i > pos+l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
}

/***************/
/***FUNCTIONS***/
/***************/

function send(msg, message, _callback){
	msg.guild.channels.get(msg.channel.id).send(message).then((message) => {
		if (typeof _callback === "function"){
			_callback(message);
		}
	});
}

function sendChannel(msg, channelID, message, _callback){
	msg.guild.channels.get(channelID).send(message).then((message) => {
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

	msg.guild.members.get(userID).mute(true);
}

function unSilence(msg, userID){
	message = createEmbed("unban", "<@" + userID + "> Unmuted :ok_hand:");
	send(msg, message);

	msg.guild.members.get(userID).mute(false);
}

function warn(msg, userID, reason){
	try{
		var warnings = serverManager.users[msg.guild.id][userID].warnings;
	} catch(e){
		var warnings = {};
	}
	try{
		var warntime = serverManager.settings[msg.guild.id].warntime;
	} catch(e){
		var warntime = 24;
	}
	if(warntime == undefined) {
		warntime = 24;
	}

	var today = new Date().getTime();
	var active = 0;
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
}

function see(msg, userID){
	if(!userHasFile(msg, userID)) return;
	var user = serverManager.users[msg.guild.id][msg.author.id];
	var warnings = "";
	var kicks = "";
	var bans = "";
	var unbans = ""
	var nicks = "";

	for(key in user.warnings){
		warnings += dateToString(user.warnings[key].date) + " - " + user.warnings[key].mod + " - " + user.warnings[key].reason + "\n";
	}
	if(warnings == "") warnings = "-";
	for(key in user.kicks){
		kicks += dateToString(user.kicks[key].date) + " - " + user.kicks[key].mod + " - " + user.kicks[key].reason + "\n";
	}
	if(kicks == "") kicks = "-";
	for(key in user.bans){
		bans += dateToString(user.bans[key].date) + " - " + user.bans[key].mod + " - " + user.bans[key].reason + "\n";
	}
	if(bans == "") bans = "-";
	for(key in user.unbans){
		unbans += dateToString(user.unbans[key].date) + " - " + user.unbans[key].mod + " - " + user.unbans[key].reason + "\n";
	}
	if(unbans == "") unbans = "-";
	for(key in user.nicks){
		nicks += dateToString(user.nicks[key].date) + " - " + user.nicks[key].nick + "\n";
	}
	if(nicks == "") nicks = "-";

	var fields = [
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
	if(serverManager.settings[msg.guild.id].logchannel == undefined){
		send(channelID, message);
	} else {
		sendChannel(msg, serverManager.settings[msg.guild.id].logchannel, message);
	}
}

function getIdFromMention(mention){

	return mention.match(/\d+/)[0];
}

function userHasFile(msg, userID){
	if(serverManager.users[msg.guild.id] == undefined) return false;

	var user = serverManager.users[msg.guild.id][userID];

	if(user == undefined){
		message = createEmbed("info", "User has no file!");
		if(serverManager.settings[msg.author.id].logchannel == undefined){
			send(channelID, message);
		} else {
			sendChannel(msg, serverManager.settings[msg.guild.id].logchannel, message);
		}
		return false;
	}
	return true;
}

function broadcastNextSpeed(msg, market){
	var speeds = [];
	var str = "";
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
			} else {
				send(msg, createEmbed("info", speedCommand.help));
			}
		})
	});
}

function broadcastSpeed(msg, market){
	var speeds = [];
	var str = "";
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
	msg.guild.channels.get(serverManager.settings[msg.guild.id].voiceChannel).join().then(con => _callback(con));
}

function leaveVoiceChannel(msg){
	msg.guild.channels.get(serverManager.settings[msg.guild.id].voiceChannel).leave();
}

function playSong(msg){
	var connection = bot.voiceConnections.get(msg.guild.id);
	var video = serverManager.songQueue[msg.guild.id][0];

	if(video.type == "song"){
		var videoID = video.videoID;

		sendChannel(msg, serverManager.settings[msg.guild.id].musicChannel, {
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
	} else if(video.type == "playlist"){
		if(video.shuffle){
			var shuffleValue = "on";
			video.current = Math.floor(Math.random()*video.songs.length);
		} else {
			var shuffleValue = "off";
			video.current = 0;
		}

		var videoID = video.songs[video.current].videoID;

		YouTubeVideo(video.songs[video.current].videoID, function(obj){
			sendChannel(msg, serverManager.settings[msg.guild.id].musicChannel, {
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
			sendChannel(msg, serverManager.settings[msg.guild.id].musicChannel, createEmbed("info", "Queue finished"));
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
	if(!serverManager.isAdmin(msg)){
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
		var song = {
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

		var message = createEmbed("music");
		message.embed.title = song.title;
		message.embed.footer =  {
			icon_url: song.avatar,
			text: "Queued by " + song.username
		}

		sendChannel(msg, serverManager.settings[msg.guild.id].musicChannel, message);

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

		var message = createEmbed("music");
		message.embed.title = playlist.title;
		message.embed.footer = {
			icon_url: playlist.avatar,
			text: "Queued by " + playlist.username
		}

		sendChannel(msg, serverManager.settings[msg.guild.id].musicChannel, message);

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

		var videoSearch = data.items[0];
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

		var videoResult = data.items[0];
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

function evalCommand(msg){
	try{
		const code = msg.params.join(" ");
		let evaled = eval(code);

		if(typeof evaled !== "string"){
			evaled = require("util").inspect(evaled);
		}
		msg.channel.send(">" + clean(code), {code:"xl"});
		msg.channel.send(clean(evaled), {code:"xl"});
	} catch(err){
		msg.channel.send(clean(code), {code:"xl"});
		msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
	}
	return false;
}

function evalTCommand(msg){
	try{
		const code = msg.params.join(" ");

		require('child_process').exec(code, function(error, stdout, stderr){
			msg.channel.send(">" + clean(code), {code:"xl"});
			if(error !== null) msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
			var message = stdout;
			if(message.length > 2000){
				message = splitter(message, 2000);
				while(message.length > 0){
					msg.channel.send(clean(message.shift()), {code: "xl"});
				}
			}else {
				msg.channel.send(clean(message), {code: "xl"});
			}
		});
	} catch(err){
		msg.channel.send(code, {code:"xl"});
		msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
	}
	return false;
}

function fetchCommand(msg){
	try{
		msg.channel.send(createEmbed("info", "Fetching files.."));
		require('child_process').exec('ssh pi@home.dupbit.com scp joren@Joren.local:/Users/joren/repos/discord_dupbot/*.js root@dupbit.com:/root/repos/discord_dupbot/', function(error, stdout, stderr){
			bot.user.lastMessage.edit(createEmbed("info!", "Files fetched succesfully, applying update.."));
			listener.emit("reload");
		})
	} catch(err){
		msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
	}
	return false;
}

function pingCommand(msg){
	message = createEmbed("info", "Pong");
	send(msg, message);
}

function getrolesCommand(msg){
	message = createEmbed("info", serverManager.getRoles(msg).map(x => ("<@&" + x + ">")).join(", "), "Roles");
	send(msg, message);
}

function killCommand(msg){
	if(msg.params.length == 0){
		if(serverManager.isAdmin(msg)){
			message = createEmbed("info", "Admins are immortal");
			send(msg, message);
			return;
		}
		message = createEmbed("kick", msg.auther.username + " died...");
		send(msg, message);
		kick(msg, msg.author.id);
	} else if (msg.params.length >= 1){
		if(!serverManager.isAdmin(msg)){
			message = createEmbed("info", "You can't kill people :point_up:");
			send(msg, message);
			return;
		}
		if(serverManager.getMention(msg)){
			kick(msg, serverManager.getMention(msg) );
		}
	}
}

function kickCommand(msg){
	if (msg.params.length >= 1){
		var targetID = serverManager.getMention(msg);
		if(targetID){
			if(msg.params.length >= 2){
				var message = "You are kicked because: ";
				var reason = "";
				for (i = 1; i<msg.params.length; i++){
					reason += " " + msg.params[i];
				}
				kick(msg, targetID, message + reason);
				log(msg, targetID, "kick", reason);
			} else {
				kick(msg, targetID );
				log(msg, targetID, "kick", "No reason specified");
			}
		}
	}
}

function warnCommand(msg){
	if (msg.params.length >= 1){
		var targetID = serverManager.getMention(msg);
		if(targetID){
			var message = "<@" + targetID + "> warning! You got a warning for: ";

			if(msg.params.length >= 2){
				var reason =  "";
				for (i = 1; i<msg.params.length; i++){
					reason += " " + msg.params[i];
				}
				bot.users.get(targetID).send(message + reason)
				log(msg, targetID, "warn", reason);
				warn(msg, targetID, message + reason);
			} else {
				bot.users.get(targetID).send("Warning! Behave yourself or you'll be kicked")
				log(msg, targetID, "warn", "No reason specified");
				warn(msg, targetID, "<@" + targetID + "> warning! Behave!");
			}
		}
	}
}

function banCommand(msg){
	if (msg.params.length >=1){
		if(serverManager.getMention(msg)){
			if(msg.params.length >= 2){
				var message = "You are banned because:";
				var reason = "";
				for (i = 1; i<msg.params.length; i++){
					reason += " " + msg.params[i];
				}
				var targetID = serverManager.getMention(msg);
				ban(msg, targetID, message + reason);
				log(msg, targetID, "ban", reason);
			} else {
				message = createEmbed("info", "You must specify a reason for a ban");
				send(msg, message);
			}
		}
	}
}

function tempbanCommand(msg){
	if (msg.params.length >= 1){
		if(serverManager.getMention(msg)){
			if(msg.params.length >= 3){
				var message = "You are banned for " + msg.params[1] + " days, because: ";
				var reason = "";
				for (i = 2; i<msg.params.length; i++){
					reason += " " + msg.params[i];
				}
				var targetID = serverManager.getMention(msg);
				ban(msg, targetID, message + reason, msg.params[1]);
				log(msg, targetID, "tempban", reason, msg.params[1]);
			} else {
				message = createEmbed("info", "You must specify a time and a reason for a tempban");
				send(msg, message);
			}
		}
	}
}

function unbanCommand(msg){
	if (msg.params.length >= 1){
		if(msg.params[0] in serverManager.users[msg.guild.id].bans){
			unban(msg, msg.params[0]);
			log(msg, serverManager.users[msg.guild.id].bans[msg.params[0]], "unban");
		}
	} else {
		title = "Banned players:";
		message = "";
		var bans = serverManager.users[msg.guild.id].bans;
		for(key in bans){
			message += "  * " + bans[key] + ": " + key + "\n";
		}
		message = createEmbed("info", message, title);
		sendChannel(msg, serverManager.settings[msg.guild.id].logchannel, message);
	}
}

function sayCommand(msg){
	message = createEmbed("info", msg.params.join(" "));
	send(msg, message);
}

function silenceCommand(msg){
	if (msg.params.length >= 1){
		if(serverManager.getMention(msg)){
			silence(msg, serverManager.getMention(msg));
		}
	}
}

function unsilenceCommand(msg){
	if (msg.params.length >= 1){
		if(serverManager.getMention(msg)){
			unSilence(msg, serverManager.getMention(msg));
		}
	}
}

function seeCommand(msg){
	if (msg.params.length >= 1){
		see(msg, serverManager.getMention(msg));
	}
}

function helpCommand(msg){
	if(msg.guild.id == "110373943822540800") return; //mute help command for specific guilds Discord Bots
	if (msg.params.length >= 1){
		try{
			var helpmsg = commands[msg.params[0]].description;
			//var help = GLOBAL[msg.params[0] + "Command"].help;
		} catch (e){
			var helpmsg = "No command";
		}
		message = createEmbed("info", helpmsg);
		send(msg, message);
	} else {
		message = createEmbed("info", "All available commands, more info !help <command>", "Commands", [
		{
			name: "Everyone",
			value: "!ping, !getroles, !kill, !help, !iam"
		},{
			name: "Music",
			value: "!play, !skip, !queue"
		},{
			name: "Cards Against Humanity",
			value: "!cstart, !cjoin, !cleave, !c, !choose, !creset",
		},{
			name: "Admin only",
			value: "!kick, !warn, !ban, !tempban, !unban, !setrole, !delrole,\n!set, !say, !silence, !unsilence, !see, !reload, !nuke"
		}
		]);
		send(msg, message);
	}
}

function permissionsCommand(msg){
	db.getPermissions(msg.guild.id, "allPermissions", (permissions) => {
		let disabled = [];
		let everyone =  [];
		let mod = [];
		let owner = [];
		let botOwner = [];

		for(let i = 0; i < permissions.length; i++){
			let command = permissions[i].command;
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
		message = createEmbed("info", "Permissions of all commands", "Permissions", [
			{
				name: "Disabled",
				value: disabled.join(", ")
			}, {
				name: "Everyone",
				value: everyone.join(", ")
			}, {
				name: "Moderator",
				value: mod.join(", ")
			}, {
				name: "Owner",
				value: owner.join(", ")
			}
		]);
		send(msg, message);
	});
}

function speedCommand(msg){
	if (msg.params.length == 0){
		broadcastNextSpeed(msg, "nl");
	} else if(msg.params.length == 1){
		broadcastNextSpeed(msg, msg.params[0]);
	} else {
		if (msg.params[1] == "all"){
			broadcastSpeed(msg, msg.params[0]);
		} else {
			message = createEmbed("info", speedCommand.help);
			send(msg, message);
		}
	}
}

function reloadCommand(msg){
	message = createEmbed("info", "reloading..");
	send(msg, message, function(){
		listener.emit("reload");
	});
}

function nukeCommand(msg){
	if(msg.params.length >= 1){
		messageLimit = msg.params[0];
	} else {
		messageLimit = 50;
	}

	msg.channel.bulkDelete(messageLimit);
}

function setCommand(msg){
	if(serverManager.settings[msg.guild.id] == undefined){
		serverManager.settings[msg.guild.id] = {};
	}

	if(msg.params.length >= 1){
		switch(msg.params[0]){
			case "log":
				serverManager.settings[msg.guild.id].logchannel = msg.channel.id;
				message = createEmbed("succes", "Logchannel set.");
				send(msg, message);
				break;

			case "warntime":
				if(msg.params.length >= 2){
					serverManager.settings[msg.guild.id].warntime = msg.params[1];
					message = createEmbed("succes", "Warntime set to " + msg.params[1] + " hours.");
					send(msg, message);
				} else {
					message = createEmbed("info", "!set warntime <hours>");
					send(msg, message);
				}
				break;

			case "role":
				if(msg.params.length >= 2){
					if(serverManager.settings[msg.guild.id].role == undefined) serverManager.settings[msg.guild.id].role = {};

					roleID = serverManager.getMentionRole(msg);

					if(roleID){
						var role = serverManager.settings[msg.guild.id].role;

						if(roleID in role){
							delete role[roleID];
						} else {
							role[roleID] = roleID;
						}

						allRoles = [];

						for(key in role){
							allRoles.push("<@&" + role[key] + ">");
						}

						message = createEmbed("info", allRoles.join(", "), "All assignable roles:");
						send(msg, message);
					}
				} else {
					message = createEmbed("info", "!set role <@Role>");
					send(msg, message);
				}
				break;

			case "admin":
				if(msg.params.length >= 2){
					roleID = serverManager.getMentionRole(msg);
					if(roleID){
						serverManager.settings[msg.guild.id].adminRole = roleID;
						message = createEmbed("succes", "Adminrole set to <@&" + roleID + ">");
						send(msg, message);
					}
				} else {
					message = createEmbed("info", "!set admin @Role");
					send(msg, message);
				}
				break;

			case "voice":
				if(msg.params.length >=2){
					channelID = msg.params[1];
					if(serverManager.isVoiceChannel(msg, channelID)){
						serverManager.settings[msg.guild.id].voiceChannel = channelID;
						message = createEmbed("succes", "Voice channel set to <#" + channelID + ">");
						send(msg, message);
					} else {
						message = createEmbed("fail", "Not a voice channel");
						send(msg, message);
					}
				} else {
					message = createEmbed("info", "!set voice plainChannelID");
					send(msg, message);
				}
				break;

			case "music":
				serverManager.settings[msg.guild.id].musicChannel = msg.channel.id;
				message = createEmbed("succes", "Music channel set.");
				send(msg, message);
				break;

			case "deleteCommands":
				if(serverManager.settings[msg.guild.id].deleteCommands){
					serverManager.settings[msg.guild.id].deleteCommands = false;
					message = createEmbed("succes", "Commands won't be deleted anymore.");
				} else {
					serverManager.settings[msg.guild.id].deleteCommands = true;
					message = createEmbed("succes", "Commands will be deleted.");
				}
				send(msg, message);
				break;

			case "perm":
				if(msg.params.length >= 3){
					let command = msg.params[1];
					let value = msg.params[2];

					db.setPermissions(msg.guild.id, command, value);
				}
				break;

			default:
				message = createEmbed("info", setCommand.help);
				send(msg, message);
				break;
		}
	} else {
		message = createEmbed("info", setCommand.help);
		send(msg, message);
	}

	serverManager.saveSettings();
}

function iamCommand(msg){
	if(serverManager.settings[msg.guild.id] == undefined || serverManager.settings[msg.guild.id].musicChannel == undefined || serverManager.settings[msg.guild.id].voiceChannel == undefined){
		var message = createEmbed("warn", "Please ask your Admin to set iam roles before you can use them.");
		send(msg, message);
		return
	}
	if (msg.params.length >= 1){
		roleID = serverManager.getMentionRole(msg);

		if(serverManager.getRoles(msg).indexOf(roleID) == -1){
			addToRole(msg, msg.author.id, roleID);
		} else {
			removeFromRole(msg, msg.author.id, roleID);
		}
	} else {
		allRoles = [];
		var role = serverManager.settings[msg.guild.id].role;
		for(key in role){
			allRoles.push("<@&" + role[key] + ">");
		}
		message = createEmbed("info", allRoles.join(", "), "You can assign yourself these roles:");
		send(msg, message);
	}
}

function setroleCommand(msg){
	userID = serverManager.getMention(msg);
	roleID = serverManager.getMentionRole(msg);
	if(userID && roleID){
		addToRole(msg, userID, roleID);
	}
}

function delroleCommand(msg){
	userID = serverManager.getMention(msg);
	roleID = serverManager.getMentionRole(msg);

	if(userID && roleID){
		removeFromRole(msg, userID, roleID);
	}
}

function playCommand(msg){
	if(msg.params.length > 0){
		if(serverManager.songQueue[msg.guild.id] == undefined) serverManager.songQueue[msg.guild.id]= [];
		if(serverManager.settings[msg.guild.id] == undefined || serverManager.settings[msg.guild.id].musicChannel == undefined || serverManager.settings[msg.guild.id].voiceChannel == undefined){
			var message = createEmbed("warn", "Please ask your Admin to set the music channel [text] and the voice channel [voice] for the bot");
			send(msg, message);
			return
		}
		if(serverManager.songQueue[msg.guild.id].length >= 100){
			return;
		}

		if(msg.params[0].indexOf("watch?v=") != -1){
			addSongToQueue(msg, msg.params[0].split("watch?v=")[1].split("&")[0]);
		} else if(msg.params[0].indexOf("playlist?list=") != -1){
			shuffle = false;
			if(msg.params.length > 1){
				if(msg.params[1] == "shuffle"){
					shuffle = true;
				}
			}
			addPlaylistToQueue(msg, msg.params[0].split("playlist?list=")[1].split("&")[0], shuffle);
		} else {
			YouTubeSearch(msg.params.join(" "), function(video){
				addSongToQueue(msg, video.id);
			});
		}
	}
}

function skipCommand(msg){
	if(bot.voiceConnections.get(msg.guild.id)){
		nextSong(msg);
	}
}

function queueCommand(msg){
	message = "";
	if(serverManager.songQueue[msg.guild.id] == undefined) serverManager.songQueue[msg.guild.id]= [];
	for(song in serverManager.songQueue[msg.guild.id]){
		if(serverManager.songQueue[msg.guild.id][song].type == "playlist"){
			var playlist = " | Playlist " + serverManager.songQueue[msg.guild.id][song].songs.length + " songs left";
		} else {
			var playlist = "";
		}
		message += song + ": " + serverManager.songQueue[msg.guild.id][song].title + playlist + "\n";
	}
	message = createEmbed("music", message, "Song queue");
	sendChannel(msg, serverManager.settings[msg.guild.id].musicChannel, message);
}

function inviteCommand(msg){
	msg.member.send("https://discordapp.com/oauth2/authorize/?permissions=2146958591&scope=bot&client_id=346727503357935616")
}

function cahStartCommand(msg){
	cah.start(msg);
}

function cahJoinCommand(msg){
	cah.join(msg);
}

function cahLeaveCommand(msg){
	cah.leave(msg);
}

function cahChooseCommand(msg){
	cah.choose(msg);
}

function cahResetCommand(msg){
	cah.reset(msg);
}

function cahScoreboardCommand(msg){
	cah.scoreboard(msg);
}
