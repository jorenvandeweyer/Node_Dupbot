const google = require("googleapis");
const ytdl = require("ytdl-core");
const {youtubeAuth} = require("../../serverSettings.json");
const streamOptions = { seek: 0, volume: 1 };

const youtube = google.youtube({
    version: "v3",
    auth: youtubeAuth
});

let queue = new Map();
let collectors = new Map();

module.exports = {
    get queue() {
        return queue;
    },
    addSong: addSong,
    nextSong: nextSong,
};

function addSong(Client, msg) {
    if (!queue.has(msg.guild.id)) {
        queue.set(msg.guild.id, new Array());
    }

    if (msg.params[0].includes("watch?v=")) {
        let videoId = msg.params[0].split("watch?v=")[1].split("&")[0];
        addSongToQueue(Client, msg, videoId);
    } else if (msg.params[0].includes("playlist?list=")) {
        let shuffle = msg.params.includes("shuffle");
        let playlistId = msg.params[0].split("playlist?list=")[1].split("&")[0];
        addPlaylistToQueue(Client, msg, playlistId, shuffle);
    } else {
        YouTubeSearch(Client, msg.params.join(" "), (video) => {
            addSongToQueue(Client, msg, video.id);
        });
    }
}

function nextSong(Client, msg) {
    if (msg.permissionLevel < 2) {
        if (queue.get(msg.guild.id).length > 0) {
            if (queue.get(msg.guild.id)[0].userID !== msg.author.id) {
                return;
            }
        } else {
            return;
        }
    }
    if (msg.params.length > 0) {
        if (msg.params[0] === "playlist") {
            queue.get(msg.guild.id)[0].type = "skipPlaylist";
        }
    }

    Client.bot.voiceConnections.get(msg.guild.id).dispatcher.end();
}

function YouTubeSearch(Client, search, _callback) {
    youtube.search.list({
        part: "snippet",
        q: search,
        maxResults: "1",
        type: "video"
    }, function (err, data) {
        if (err) return;

        let videoSearch = data.items[0];
        if (videoSearch === undefined) return;
        _callback({
            id: videoSearch.id.videoId,
            title: videoSearch.snippet.title,
        });
    });
}

function addSongToQueue(Client, msg, id) {
    YouTubeVideo(id, function(video) {
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
        };

        queue.get(msg.guild.id).push(song);

        let embed = new Client.RichEmbed();
        embed.setTitle(song.title);
        embed.setColor(Client.statusColors.get("purple"));
        embed.setFooter("Queued by " + song.username, song.avatar);

        Client.db.getSettings(msg.guild.id, "musicChannel").then((channelId) => {
            if (channelId) {
                Client.sendChannel(msg, channelId, embed);
            } else {
                Client.send(msg, embed);
            }
        });

        if (!Client.bot.voiceConnections.get(msg.guild.id)) {
            Client.joinVoiceChannel(msg).then(() => {
                playSong(Client, msg);
            });
        }

    });
}

function YouTubeVideo(id, _callback) {
    youtube.videos.list({
        id: id,
        part: "snippet,contentDetails"
    },  (err, data) => {
        if (err) return;

        let videoResult = data.items[0];
        if (videoResult === undefined) return;

        _callback({
            id: videoResult.id,
            duration: convertTimeToString(convertYTDuration(videoResult.contentDetails.duration)),
            seconds: convertYTDuration(videoResult.contentDetails.duration),
            title: videoResult.snippet.title,
            channel: videoResult.snippet.channelTitle,
            thumbnail: videoResult.snippet.thumbnails.medium.url
        });
    });
}

function addPlaylistToQueue(Client, msg, id, shuffle) {
    YouTubePlaylist({
        id: id,
        maxResults: "50"
    }, (object) => {
        let playlist = {
            type: "playlist",
            userID: msg.author.id,
            username: msg.author.username,
            avatar: msg.author.avatarURL,
            title: object.title,
            songs: [],
            shuffle: shuffle
        };

        let songs = object.items;
        for (let i = 0; i < songs.length; i++) {
            let video = songs[i].snippet;
            try {
                let song = {
                    videoID: video.resourceId.videoId,
                    title: video.title,
                    channel: video.channelTitle,
                    thumbnail: video.thumbnails.default.url
                };
                playlist.songs.push(song);
            } catch(e) {
                Client.Logger.error(`Shard[${Client.shard.id}]: ${e}`);
            }

        }

        if (!queue.has(msg.guild.id)) queue.set(msg.guild.id, new Array());
        queue.get(msg.guild.id).push(playlist);

        let embed = new Client.RichEmbed();
        embed.setTitle(playlist.title);
        embed.setColor(Client.statusColors.get("purple"));
        embed.setFooter("Queued by " + playlist.username, playlist.avatar);

        Client.db.getSettings(msg.guild.id, "musicChannel").then((channelId) => {
            if (channelId) {
                Client.sendChannel(msg, channelId, embed);
            } else {
                Client.send(msg, embed);
            }
        });

        if (!Client.bot.voiceConnections.get(msg.guild.id)) {
            Client.joinVoiceChannel(msg).then(() => {
                playSong(Client, msg);
            });
        }

    });
}

function YouTubePlaylist(object, _callback) {
    youtube.playlistItems.list({
        playlistId: object.id,
        pageToken: object.pageToken,
        maxResults: object.maxResults,
        part: "snippet,contentDetails"
    }, (err, data) => {
        if (data.items[0] === undefined) return;
        if (object.items === undefined) object.items = [];

        object.items.push.apply(object.items, data.items);

        if (data.nextPageToken) {
            object.pageToken = data.nextPageToken;
            if (data.pageInfo.totalResults - object.items.length > 50) {
                object.maxResults = 50;
            } else {
                object.maxResults = data.pageInfo.totalResults - object.items.length;
            }
            YouTubePlaylist(object, _callback);
        } else {
            youtube.playlists.list({
                id: object.id,
                part: "snippet, contentDetails"
            }, (err, data2) => {
                object.title = data2.items[0].snippet.title;
                _callback(object);

            });
        }
    });
}

function convertYTDuration(duration) {
    let a = duration.match(/\d+/g);

    if (duration.indexOf("M") >= 0 && duration.indexOf("H") === -1 && duration.indexOf("S") === -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf("H") >= 0 && duration.indexOf("M") === -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf("H") >= 0 && duration.indexOf("M") === -1 && duration.indexOf("S") === -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length === 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length === 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length === 1) {
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

function playSong(Client, msg) {
    let video = queue.get(msg.guild.id)[0];
    let videoID;

    if (video.type === "song") {
        videoID = video.videoID;

        Client.db.getSettings(msg.guild.id, "musicChannel").then((channelId) => {
            if (channelId) {
                let embed = new Client.RichEmbed();
                embed.setTitle("=-=-=-=-=-=-= Song =-=-=-=-=-=-=");
                embed.setColor(Client.statusColors.get("purple"));
                embed.addField("Now Streaming", video.title);
                embed.addField("Duration", video.duration);
                embed.addField("Channel", video.channel);
                embed.setFooter("Requested by " + video.username, video.avatar);
                embed.setThumbnail(video.thumbnail);

                Client.sendChannel(msg, channelId, embed).then(addSongFeedback);
            }
        });
    } else if (video.type === "playlist") {
        let shuffleValue = "off";
        video.current = 0;

        if (video.shuffle) {
            shuffleValue = "on";
            video.current = Math.floor(Math.random()*video.songs.length);
        }

        videoID = video.songs[video.current].videoID;

        YouTubeVideo(video.songs[video.current].videoID, (obj) => {
            Client.db.getSettings(msg.guild.id, "musicChannel").then((channelId) => {
                if (channelId) {
                    let embed = new Client.RichEmbed();
                    embed.setTitle("=-=-=-=-=-=-= Playlist =-=-=-=-=-=-=");
                    embed.setColor(Client.statusColors.get("purple"));
                    embed.addField(video.title, video.songs.length + " songs left in playlist || shuffle " + shuffleValue);
                    embed.addField("Now Streaming", obj.title);
                    embed.addField("Duration", obj.duration);
                    embed.addField("Channel", obj.channel);
                    embed.setFooter("Requested by " + video.username, video.avatar);
                    embed.setThumbnail(obj.thumbnail);

                    Client.sendChannel(msg, channelId, embed, addSongFeedback);
                }
            });
        });
    }

    let stream = ytdl("https://www.youtube.com/watch?v=" + videoID, {  });

    let connection = Client.bot.voiceConnections.get(msg.guild.id);
    let dispatcher = connection.playStream(stream, streamOptions);

    dispatcher.on("end", () => {
        if (collectors.has(msg.guild.id)) {
            collectors.get(msg.guild.id).stop();
        }

        if (video.type === "song") {
            queue.get(msg.guild.id).shift();
        } else if (video.type === "playlist") {
            if (video.songs.length === 1) {
                queue.get(msg.guild.id).shift();
            } else {
                video.songs.splice(video.current, 1);
            }
        } else {
            queue.get(msg.guild.id).shift();
        }

        if (queue.get(msg.guild.id).length > 0) {
            setTimeout(() =>{
                playSong(Client, msg);
            }, 1000);
        } else {
            msg.guild.voiceConnection.channel.leave();
            Client.db.getSettings(msg.guild.id, "musicChannel").then((channelId) => {
                if (channelId) {
                    Client.sendChannel(msg, channelId, Client.createEmbed("info", "Queue finished"));
                }
            });
        }
    });
}

function addSongFeedback(msg) {
    try {
        msg.react("❌");
        //msg.react("✅");
        const collector = msg.createReactionCollector( (reaction) => {
            return reaction.emoji.name === "❌" || reaction.emoji.name === "✅";
        }, {
            time: 60 * 60 * 100
        });
        collectors.set(msg.guild.id, collector);

        collector.on("collect", (r) => {
            if (r.emoji.name === "❌") {
                let users = r.users.filter((value) => {
                    return msg.guild.members.get(value.id).voiceChannelID === msg.guild.voiceConnection.channel.id;
                });
                if (users.size > msg.client.voiceConnections.get(msg.guild.id).channel.members.size / 2) {
                    msg.client.voiceConnections.get(msg.guild.id).dispatcher.end();
                }
            }
        });
    } catch (e) {
        //no react permissions
    }

}
