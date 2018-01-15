module.exports = {
    name: "reload",
    description: "!reload",
    defaultPermission: 4,
    failPermission: "You can't reload the bot",
    args: 0,
    guildOnly: false,
    execute(Client, msg){
        if(msg.params.includes("--fetch")){
            let message = Client.createEmbed("warning", "<:empty:314349398723264512><:update:264184209617321984>");
            Client.send(msg, message).then((message) => {
                require('child_process').exec("git pull", (error, stdout, stderr) => {
                    if(error !== null) msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
                    if(stderr) msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(stderr)}\n\`\`\``);
                    console.log(stdout);
                    message.edit({embed:{color:3447003 , description:"<:empty:314349398723264512><a:loading:393852367751086090>"}}).then((message) => {
                        Client.bot.shard.send({type: "reload", msg:{ id: message.id, channel: message.channel.id}});
                        Client.db.close();
                        process.exit();
                    });
                });
            });
        } else {
            let message = Client.createEmbed("info", "<:empty:314349398723264512><a:loading:393852367751086090>");
        	Client.send(msg, message).then((message) => {
                Client.bot.shard.send({type: "reload", msg:{ id: message.id, channel: message.channel.id}});
                Client.db.close();
                process.exit();
        	});
        }
    }
};

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
