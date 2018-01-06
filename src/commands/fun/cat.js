const request = require('request');
const {thecatapi} = require("../../serverSettings.json");

module.exports = {
    name: "cat",
    description: "cat",
    defaultPermission: 1,
    args: 0,
    execute(Client, msg){
        // request("http://random.cat/meow", (err, res, body) => {
        //     if(err) return console.log(err);
        //     Client.send(msg, JSON.parse(body).file);
        // }); old
        request("http://thecatapi.com/api/images/get?format=xml&api_key=" + thecatapi, (err, res, body) => {
            if(err) return console.log(err);
            Client.send(msg, {
                embed:{
                    title: ":heart_eyes_cat: :heart_eyes_cat: :heart_eyes_cat:",
                    image: {
                        url: body.split("<url>")[1].split("</url>")[0]
                    }
                }
            });
        });
    }
};
