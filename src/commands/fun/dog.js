const request = require("request");

module.exports = {
    name: "dog",
    defaultPermission: 1,
    args: 0,
    execute (Client, msg) {
        request("https://api.thedogapi.co.uk/v2/dog.php", (err, res, body) => {
            if (err) return Client.Logger.error(`Shard[${Client.shard.id}]: ${err}`);
            Client.send(msg, {
                embed:{
                    title: ":dog: :dog: :dog:",
                    image: {
                        url: JSON.parse(body).data[0].url
                    }
                }
            });
        });
    }
};
