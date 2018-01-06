const request = require('request');

module.exports = {
    name: "color",
    description: "color",
    defaultPermission: 1,
    usage: "<rgb, hex>",
    args: 0,
    execute(Client, msg){
        let url = "";
        if(msg.params.length == 0){
            url = "http://www.colourlovers.com/api/colors/random?format=json";
        } else if(msg.params.length == 1){
            url = "http://www.colourlovers.com/api/color/" + msg.params[0] + "?format=json";
        } else if(msg.params.length == 3){
            msg.params = msg.params.map((x) => {
                let str = parseInt(x).toString(16);
                if(str.length == 1) str = "0" + str;
                return str;
            });
            if(msg.params.join("").length > 6) return;
            url = "http://www.colourlovers.com/api/color/" + msg.params.join("") + "?format=json"
        } else {
            return Client.send(msg, Client.createEmbed("fail", "You are using this command wrong"));
        }

        request(url, (err, res, body) => {
            if(err) return console.log(err);
            let color = JSON.parse(body)[0];

            let embed = new Client.Discord.RichEmbed();
            embed.setTitle(color.title);
            embed.setDescription("```\nColor: #" + color.hex + " \nRGB: " + color.rgb.red + " " + color.rgb.green + " " + color.rgb.blue + "\n```");
            embed.setImage(color.imageUrl);
            embed.setColor(parseInt(color.hex, 16));
            
            Client.send(msg, embed);
        });
    }
};
