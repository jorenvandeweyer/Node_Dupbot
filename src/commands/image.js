const Discord = require('discord.js');
const Request = require("request");

module.exports = {
    name: "image",
    description: "!image",
    usage: "<query>",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        Request.get('https://api.unsplash.com/photos/random?count=1&query=' + msg.params.join("-"), {
            'auth': {
                'bearer': 'Client-ID ***REMOVED***'
            }
        }, (err, res, body) => {
            let data = JSON.parse(body);
            let image = data[0];
            let referal = "?utm_source=dupbot&utm_medium=referral"

            let currentEmbed = new Discord.RichEmbed();
            currentEmbed.setTitle(`Result for: ${msg.params.join(" ")}`)
                .setURL(image.links.html + referal)
                .setAuthor(`Author: ${image.user.name}`, image.user.profile_image.small , image.user.links.html + referal)
                .setImage(image.urls.full)
                .setColor(image.color)
                .setFooter("image provided by Unsplash", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_Unsplash.svg/2000px-Logo_of_Unsplash.svg.png");
            self.send(msg, currentEmbed);
        });
    }
};
