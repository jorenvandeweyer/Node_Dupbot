module.exports = {
    name: "queue",
    description: "!queue",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        message = "";
    	if(Client.serverManager().songQueue[msg.guild.id] == undefined) Client.serverManager().songQueue[msg.guild.id]= [];
    	for(song in Client.serverManager().songQueue[msg.guild.id]){
    		let playlist = "";
    		if(Client.serverManager().songQueue[msg.guild.id][song].type == "playlist"){
    			playlist = " | Playlist " + Client.serverManager().songQueue[msg.guild.id][song].songs.length + " songs left";
    		}
    		message += song + ": " + Client.serverManager().songQueue[msg.guild.id][song].title + playlist + "\n";
    	}
    	Client.db.getSettings(msg.guild.id, "musicChannel", (channelId) => {
    		message = Client.createEmbed("music", message, "Song queue");
    		if(channelId){
    			Client.sendChannel(msg, channelId, message);
    		} else {
    			Client.send(msg, message);
    		}
    	});
    }
};
