module.exports = {
    name: "embed",
    description: "!embed",
    usage: "<params>",
    defaultPermission: 4,
    args: 0,
    execute(Client, msg){
        if(msg.params.includes("--create")){
            if(Client.currentEmbed == undefined){
                Client.currentEmbed = new Client.RichEmbed();
            } else {
                Client.send(msg, Client.createEmbed("info", "there is already one existing embed"));
            }
        } else if(msg.params.includes("--delete")){
            Client.currentEmbed = undefined;
            Client.send(msg, Client.createEmbed("info", "Embed deleted"));
        } else if(msg.params.includes("--url")){
            let index = msg.params.indexOf("--url");
            msg.params.splice(index, 1);
            Client.currentEmbed.setURL(msg.params[0]);
        } else if(msg.params.includes("--title")){
            let index = msg.params.indexOf("--title");
            msg.params.splice(index, 1);
            Client.currentEmbed.setTitle(msg.params.join(" "));
        }  else if(msg.params.includes("--thumbnail")){
            let index = msg.params.indexOf("--thumbnail");
            msg.params.splice(index, 1);
            Client.currentEmbed.setThumbnail(msg.params[0]);
        }  else if(msg.params.includes("--image")){
            let index = msg.params.indexOf("--image");
            msg.params.splice(index, 1);
            Client.currentEmbed.setImage(msg.params[0]);
        } else if(msg.params.includes("--footer")){
            let index = msg.params.indexOf("--footer");
            msg.params.splice(index, 1);
            let url = msg.params.shift();
            Client.currentEmbed.setFooter(msg.params.join(" "), url);
        } else if(msg.params.includes("--description")){
            let index = msg.params.indexOf("--description");
            msg.params.splice(index, 1);
            Client.currentEmbed.setDescription(msg.params.join(" "));
        } else if(msg.params.includes("--color")){
            let index = msg.params.indexOf("--color");
            msg.params.splice(index, 1);
            Client.currentEmbed.setColor(msg.params[0]);
        } else if(msg.params.includes("--author")){
            Client.currentEmbed.setAuthor(msg.author.username + "#" + msg.author.discriminator, user.avatarURL);
        }

        if(Client.currentEmbed !== undefined){
            Client.send(msg, Client.currentEmbed);
        }
    }
};
