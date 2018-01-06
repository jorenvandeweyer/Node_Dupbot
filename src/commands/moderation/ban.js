module.exports = {
    name: "ban",
    description: "!ban @user [reason]",
    usage: "@user [reason]",
    defaultPermission: 2,
    failPermission: "You can't ban people :point_up:",
    args: 2,
    guildOnly: true,
    execute(Client, msg){
		if(Client.serverManager().getMention(msg)){
			if(msg.params.length >= 2){
				let message = "You are banned because:";
				let reason = "";
				for (let i = 1; i<msg.params.length; i++){
					reason += " " + msg.params[i];
				}
				let targetID = Client.serverManager().getMention(msg);
				Client.ban(msg, targetID, message + reason);
				Client.log(msg, targetID, "ban", reason);
			} else {
				let message = Client.createEmbed("info", "You must specify a reason for a ban");
				Client.send(msg, message);
			}
		}
    }
};
