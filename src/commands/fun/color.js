const request = require("request");

module.exports = {
    name: "color",
    usage: "<rgb, hex>",
    defaultPermission: 1,
    args: 0,
    async execute (Client, msg) {
        let color;
        if (msg.params.length == 0) {
            color = await randomColor();
        } else if (msg.params.length == 1) {
            color = await getColor(msg.params[0].replace("#", ""));
        } else if (msg.params.length == 3) {
            msg.params = msg.params.map((x) => {
                let str = parseInt(x).toString(16);
                if (str.length == 1) str = "0" + str;
                return str;
            });
            color = await getColor(msg.params.join(""));
        } else {
            return Client.send(msg, Client.createEmbed("fail", "You are using this command wrong"));
        }

        if (color) {
            const embed = new Client.RichEmbed();
            embed.setTitle(color.title);
            embed.setDescription("```\nColor: #" + color.hex + " \nRGB: " + color.rgb.red + " " + color.rgb.green + " " + color.rgb.blue + "\n```");
            embed.setImage(color.imageUrl);
            embed.setColor(parseInt(color.hex, 16));
            Client.send(msg, embed);
        } else {
            return Client.send(msg, Client.createEmbed("fail", "You are using this command wrong"));
        }
    }
};

async function randomColor() {
    return await get("http://www.colourlovers.com/api/colors/random?format=json");
}

async function getColor(color) {
    return await get(`http://www.colourlovers.com/api/color/${color}?format=json`);
}

function get(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject(err);
            try {
                resolve(JSON.parse(body)[0]);
            } catch (e) {
                reject(null);
            }
        });
    }).catch(() => null);
}
