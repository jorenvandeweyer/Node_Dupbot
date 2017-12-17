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
                    self.getPrefix({channel: {type: "text"}, guild: {id: guild[1].id}}, (prefix) => {
                        if(parseInt(value)){
                            let message = self.createEmbed("info", msg.params.join(" ") + `\n\nThese updates and broadcasts can be disabled by using the set command \`${prefix}set botupdates\` inside you server.`);
                            if(self.currentEmbed !== undefined && msg.params.includes("--embed")){
                                message = self.currentEmbed;
                            }
                            guild[1].owner.send(message).then((message) => {
                                messages.push(message);
                            });
                        }
                    });
                });
            }
        } else {
            messages = [];
            let guilds = msg.client.guilds;
            for(let guild of msg.client.guilds){
                self.db.getSettings(guild[1].id, "botupdates", (value) => {
                    if(parseInt(value)){

                        let channels = guild[1].channels.filter((channel) => {
                            if(channel.type == "text"){
                                return channel.permissionsFor(msg.client.user).has("SEND_MESSAGES");
                            }
                            return false;
                        });

                        let channel = channels.find(val => val.name.toLowerCase() == "general" || val.name.toLowerCase() == "chat");
                        if(channel == null) channel = channels.first();
                        if(channel == null) return;
                        try{
                            let message = self.createEmbed("info", msg.params.join(" "));
                            if(self.currentEmbed !== undefined && msg.params.includes("--embed")){
                                message = self.currentEmbed;
                            }
                            channel.send(message).then((message) => {
                                messages.push(message);
                            });
                        } catch(e){
                            console.log(e);
                        }

                    }
                });
            }
        }
    }
};
