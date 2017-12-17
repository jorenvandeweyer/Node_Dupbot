const Discord = require('discord.js');

module.exports = {
    name: "embed",
    description: "!embed",
    usage: "<params>",
    defaultPermission: 4,
    args: 0,
    execute(self, msg){

        if(msg.params.includes("--create")){
            if(self.currentEmbed == undefined){
                self.currentEmbed = new Discord.RichEmbed();
            } else {
                self.send(msg, self.createEmbed("info", "there is already one existing embed"));
            }
        } else if(msg.params.includes("--delete")){
            self.currentEmbed = undefined;
            self.send(msg, self.createEmbed("info", "Embed deleted"));
        } else if(msg.params.includes("--url")){
            let index = msg.params.indexOf("--url");
            msg.params.splice(index, 1);
            self.currentEmbed.setURL(msg.params[0]);
        } else if(msg.params.includes("--title")){
            let index = msg.params.indexOf("--title");
            msg.params.splice(index, 1);
            self.currentEmbed.setTitle(msg.params.join(" "));
        }  else if(msg.params.includes("--thumbnail")){
            let index = msg.params.indexOf("--thumbnail");
            msg.params.splice(index, 1);
            self.currentEmbed.setThumbnail(msg.params[0]);
        }  else if(msg.params.includes("--image")){
            let index = msg.params.indexOf("--image");
            msg.params.splice(index, 1);
            self.currentEmbed.setImage(msg.params[0]);
        } else if(msg.params.includes("--footer")){
            let index = msg.params.indexOf("--footer");
            msg.params.splice(index, 1);
            let url = msg.params.shift();
            self.currentEmbed.setFooter(msg.params.join(" "), url);
        } else if(msg.params.includes("--description")){
            let index = msg.params.indexOf("--description");
            msg.params.splice(index, 1);
            self.currentEmbed.setDescription(msg.params.join(" "));
        } else if(msg.params.includes("--color")){
            let index = msg.params.indexOf("--color");
            msg.params.splice(index, 1);
            self.currentEmbed.setColor(msg.params[0]);
        } else if(msg.params.includes("--author")){
            self.currentEmbed.setAuthor(msg.author.username + "#" + msg.author.discriminator, user.avatarURL);
        }



        if(self.currentEmbed !== undefined){
            self.send(msg, self.currentEmbed);
        }

    }
};
