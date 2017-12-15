let messages = [];

module.exports = {
    name: "broadcast",
    description: "broadcast <message>",
    usage: "<message>",
    defaultPermission: 4,
    args: 1,
    guildOnly: false,
    execute(self, msg){
        if(msg.params.includes("--delete")){
            while(messages.length){
                messages.shift().delete();
            }
        } else if(msg.params.includes("--edit")){
            let index = msg.params.indexOf("--edit");
            msg.params.splice(index, 1);
            for(let i = 0; i < messages.length; i++){
                messages[i].edit(self.createEmbed("info", msg.params.join(" ")));
            }
        } else if(msg.params.includes("--owner")){
            let index = msg.params.indexOf("--owner");
            msg.params.splice(index, 1);
            messages = [];

            for(let guild of msg.client.guilds){
                self.db.getSettings(guild[1].id, "botupdates", (value) => {
                    self.db.getSettings(guild[1].id, "prefix", (prefix) => {
                        if(parseInt(value)){
                            guild[1].owner.send(self.createEmbed("info", msg.params.join(" ") + `\n\nThese updates and broadcasts can be disabled by using the set command \`${prefix}set botupdates\` inside you server.`)).then((message) => {
                                messages.push(message);
                            });
                        }
                    });
                });
            }
        } else {
            messages = [];

            for(let guild of msg.client.guilds){
                self.db.getSettings(guild[1].id, "botupdates", (value) => {
                    if(parseInt(value)){
                        guild[1].channels.first().send(self.createEmbed("info", msg.params.join(" "))).then((message) => {
                            messages.push(message);
                        });
                    }
                });
            }
        }
    }
};
