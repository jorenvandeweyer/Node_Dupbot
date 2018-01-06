module.exports = {
    name: "queue",
    description: "!queue",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        message = "";
    	if(!Client.music.queue.has(msg.guild.id)) Client.queue.set(msg.guild.id, new Array());
    	for(song in Client.queue.get(msg.guild.id)){
    		let playlist = "";
    		if(Client.queue.get(msg.guild.id)[song].type == "playlist"){
    			playlist = " | Playlist " + Client.queue.get(msg.guild.id)[song].songs.length + " songs left";
    		}
    		message += song + ": " + Client.queue.get(msg.guild.id)[song].title + playlist + "\n";
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
