module.exports = {
    name: "see",
    description: "!see @name",
    usage: "@name",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        if (msg.params.length >= 1){
    		Client.see(msg, Client.serverManager().getMention(msg));
    	}
    }
};
