module.exports = {
    name: "kill",
    description: "!kill [@user]",
    usage: "[@user]",
    defaultPermission: 0,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        if(msg.params.length == 0){
    		if(msg.permissionLevel >= 2){
    			let message = Client.createEmbed("info", "Admins are immortal");
    			Client.send(msg, message);
    			return;
    		}
    		let message = Client.createEmbed("kick", msg.auther.username + " died...");
    		Client.send(msg, message);
    		Client.kick(msg, msg.author.id);
    	} else if (msg.params.length >= 1){
    		if(msg.permissionLevel < 2){
    			let message = Client.createEmbed("info", "You can't kill people :point_up:");
    			Client.send(msg, message);
    			return;
    		}
    		if(Client.extractID(msg)){
    			Client.kick(msg, Client.extractID(msg) );
    		}
    	}
    }
};
