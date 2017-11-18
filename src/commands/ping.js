module.exports = {
    name: "ping",
    description: "!ping",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        message = self.createEmbed("info", "Pong");
    	self.send(msg, message);
    }
};
