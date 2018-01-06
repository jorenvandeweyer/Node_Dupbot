const request = require('request');

module.exports = {
    name: "dog",
    description: "dog",
    defaultPermission: 1,
    args: 0,
    execute(Client, msg){
        // request("https://dog.ceo/api/breeds/image/random", (err, res, body) => {
        //     if(err) return console.log(err);
        //     Client.send(msg, JSON.parse(body).message);
        // });
        request("https://api.thedogapi.co.uk/v2/dog.php", (err, res, body) => {
            if(err) return console.log(err);
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
