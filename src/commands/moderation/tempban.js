module.exports = {
    name: "tempban",
    usage: "@user|userID <time> [reason]",
    defaultPermission: 2,
    failPermission: "You can't ban people :point_up:",
    args: 3,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
            let targetID = Client.serverManager.extractID(msg, 0)
    		if(targetID){
                msg.params.shift();
                let days = msg.params.shift();
				let reason = msg.params.join(" ");

                msg.guild.ban(targetID, {
                    reason: reason
                }).then((user) => {
                    Client.log(msg, user.id, "tempban", reason, days);
                    Client.send(msg, Client.createEmbed("ban", "<@"+ user.id + "> You have been banned :hammer:"))
                    user.send(Client.createEmbed("ban", "You have been banned for " +days + " days.\nReason: " + reason));
                    //create event
                }).catch((reason) => {
                    Client.send(msg, Client.createEmbed("fail", reason));
                });
    		}
    	}
    }
};
