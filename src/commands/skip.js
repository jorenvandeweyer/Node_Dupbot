module.exports = {
    name: "skip",
    description: "!skip (only own submissions)",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if(msg.client.voiceConnections.get(msg.guild.id)){
    		self.nextSong(msg);
    	}
    }
};
