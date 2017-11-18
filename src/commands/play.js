module.exports = {
    name: "play",
    description: "!play <youtube url, song name>",
    usage: "<youtube url, song name>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        if(msg.params.length > 0){
            if(self.serverManager().songQueue[msg.guild.id] == undefined) self.serverManager().songQueue[msg.guild.id]= [];

            self.db.getSettings(msg.guild.id, "voiceChannel", (channelId) => {
                let voiceChannelUser = msg.member.voiceChannelID;
                if(voiceChannelUser == undefined){
                    let message = self.createEmbed("warn", "Go in a voiceChannel first");
                    self.send(msg, message);
                } else if(channelId && voiceChannelUser != channelId){
                    let message = self.createEmbed("warn", "This server has a dedicated music channel <#" + channelId + "> go there please.");
                    self.send(msg, message);
                } else {
                    if(self.serverManager().songQueue[msg.guild.id].length >= 100){
                        return;
                    }

                    if(msg.params[0].indexOf("watch?v=") != -1){
                        self.addSongToQueue(msg, msg.params[0].split("watch?v=")[1].split("&")[0]);
                    } else if(msg.params[0].indexOf("playlist?list=") != -1){
                        shuffle = false;
                        if(msg.params.length > 1){
                            if(msg.params[1] == "shuffle"){
                                shuffle = true;
                            }
                        }
                        self.addPlaylistToQueue(msg, msg.params[0].split("playlist?list=")[1].split("&")[0], shuffle);
                    } else {
                        self.YouTubeSearch(msg.params.join(" "), function(video){
                            self.addSongToQueue(msg, video.id);
                        });
                    }
                }
            });
        }
    }
};
