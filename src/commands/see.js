module.exports = {
    name: "see",
    description: "!see @name",
    usage: "@name",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        if (msg.params.length >= 1){
    		self.see(msg, self.serverManager().getMention(msg));
    	}
    }
};
