module.exports = {
    name: "queue",
    description: "!queue",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        message = "";
    	if(self.serverManager().songQueue[msg.guild.id] == undefined) self.serverManager().songQueue[msg.guild.id]= [];
    	for(song in self.serverManager().songQueue[msg.guild.id]){
    		let playlist = "";
    		if(self.serverManager().songQueue[msg.guild.id][song].type == "playlist"){
    			playlist = " | Playlist " + self.serverManager().songQueue[msg.guild.id][song].songs.length + " songs left";
    		}
    		message += song + ": " + self.serverManager().songQueue[msg.guild.id][song].title + playlist + "\n";
    	}
    	self.db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
    		message = self.createEmbed("music", message, "Song queue");
    		if(channelId){
    			self.sendChannel(msg, channelId, message);
    		} else {
    			self.send(msg, message);
    		}
    	});
    }
};
