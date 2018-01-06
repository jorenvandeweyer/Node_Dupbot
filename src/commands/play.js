module.exports = {
    name: "play",
    description: "!play <youtube url, song name>",
    usage: "<youtube url, song name>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if(msg.params.length > 0){
            if(Client.serverManager().songQueue[msg.guild.id] == undefined) Client.serverManager().songQueue[msg.guild.id]= [];

            Client.db.getSettings(msg.guild.id, "voiceChannel", (channelId) => {
                let voiceChannelUser = msg.member.voiceChannelID;
                if(voiceChannelUser == undefined){
                    let message = Client.createEmbed("warn", "Go in a voiceChannel first");
                    Client.send(msg, message);
                } else if(channelId && voiceChannelUser != channelId){
                    let message = Client.createEmbed("warn", "This server has a dedicated music channel <#" + channelId + "> go there please.");
                    Client.send(msg, message);
                } else {
                    if(Client.serverManager().songQueue[msg.guild.id].length >= 100){
                        return;
                    }

                    if(msg.params[0].indexOf("watch?v=") != -1){
                        Client.addSongToQueue(msg, msg.params[0].split("watch?v=")[1].split("&")[0]);
                    } else if(msg.params[0].indexOf("playlist?list=") != -1){
                        shuffle = false;
                        if(msg.params.length > 1){
                            if(msg.params[1] == "shuffle"){
                                shuffle = true;
                            }
                        }
                        Client.addPlaylistToQueue(msg, msg.params[0].split("playlist?list=")[1].split("&")[0], shuffle);
                    } else {
                        Client.YouTubeSearch(msg.params.join(" "), function(video){
                            Client.addSongToQueue(msg, video.id);
                        });
                    }
                }
            });
        }
    }
};
