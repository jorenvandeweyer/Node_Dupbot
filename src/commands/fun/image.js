const Request = require("request");

module.exports = {
    name: "image",
    usage: "<query>",
    defaultPermission: 1,
    args: 0,
    execute (Client, msg) {
        let query = "";
        if (msg.params.length) query = "&query=" + msg.params.join("-");
        Request.get(`https://api.unsplash.com/photos/random?count=1&client_id=${Client.serverSettings.unsplash_clientid}${query}`, (err, res, body) => {
            if (err) return Client.Logger.error(`Shard[${Client.shard.id}]: ${err}`);
            if (res.statusCode !== 200) return;
            let data = JSON.parse(body);
            let image = data[0];
            let referal = "?utm_source=dupbot&utm_medium=referral";

            let currentEmbed = new Client.RichEmbed();
            currentEmbed.setTitle(`Result for: ${msg.params.join(" ")}`)
                .setURL(image.links.html + referal)
                .setAuthor(`Author: ${image.user.name}`, image.user.profile_image.small , image.user.links.html + referal)
                .setImage(image.urls.full)
                .setColor(image.color)
                .setFooter("image provided by Unsplash", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_Unsplash.svg/2000px-Logo_of_Unsplash.svg.png");
            Client.send(msg, currentEmbed);
        });
    }
};
