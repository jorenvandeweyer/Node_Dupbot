module.exports = {
    name: "kill",
    description: "!kill [@user]",
    usage: "[@user]",
    defaultPermission: 0,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if(msg.params.length == 0){
    		if(msg.permissionLevel >= 2){
    			let message = self.createEmbed("info", "Admins are immortal");
    			self.send(msg, message);
    			return;
    		}
    		let message = self.createEmbed("kick", msg.auther.username + " died...");
    		self.send(msg, message);
    		self.kick(msg, msg.author.id);
    	} else if (msg.params.length >= 1){
    		if(msg.permissionLevel < 2){
    			let message = self.createEmbed("info", "You can't kill people :point_up:");
    			self.send(msg, message);
    			return;
    		}
    		if(serverManager().getMention(msg)){
    			self.kick(msg, self.serverManager().getMention(msg) );
    		}
    	}
    }
};
