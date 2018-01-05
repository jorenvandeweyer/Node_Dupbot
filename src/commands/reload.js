module.exports = {
    name: "reload",
    description: "!reload",
    defaultPermission: 4,
    failPermission: "You can't reload the bot",
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if(msg.params.includes("--fetch")){
            let message = self.createEmbed("warning", "<:empty:314349398723264512><:update:264184209617321984>");
            self.send(msg, message, (sendMessage) => {
                require('child_process').exec("git pull", function(error, stdout, stderr){
                    if(error !== null) msg.channel.send(`\`ERROR\` \`\`\`xl\n${self.clean(error)}\n\`\`\``);
                    if(stderr) msg.channel.send(`\`ERROR\` \`\`\`xl\n${self.clean(stderr)}\n\`\`\``);
                    console.log(stdout);
                    let channelId = msg.client.user.lastMessage.channel.id;
                    let messageId = msg.client.user.lastMessage.id;
                    msg.client.channels.get(channelId).fetchMessage(messageId).then(message => {
                        message.edit({embed:{color:3447003 , description:"<:empty:314349398723264512><a:loading:393852367751086090>"}}).then(() => {
                            self.listener().emit("reload");
                            self.db.close();
                        });
                    });
                });
            });
        } else {
            let message = self.createEmbed("info", "<:empty:314349398723264512><a:loading:393852367751086090>");
        	self.send(msg, message, function(){
        		self.listener().emit("reload");
                self.db.close();
        	});
        }
    }
};
