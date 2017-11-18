module.exports = {
    name: "ban",
    description: "!ban @user [reason]",
    usage: "@user [reason]",
    defaultPermission: 2,
    failPermission: "You can't ban people :point_up:",
    args: 2,
    guildOnly: true,
    execute(self, msg){
		if(self.serverManager().getMention(msg)){
			if(msg.params.length >= 2){
				let message = "You are banned because:";
				let reason = "";
				for (i = 1; i<msg.params.length; i++){
					reason += " " + msg.params[i];
				}
				let targetID = self.serverManager().getMention(msg);
				self.ban(msg, targetID, message + reason);
				self.log(msg, targetID, "ban", reason);
			} else {
				message = self.createEmbed("info", "You must specify a reason for a ban");
				self.send(msg, message);
			}
		}
    }
};
