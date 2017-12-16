const request = require('request');

module.exports = {
    name: "dog",
    description: "dog",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        request("https://dog.ceo/api/breeds/image/random", (err, res, body) => {
            if(err) return console.log(err);
            self.send(msg, JSON.parse(body).message);
        });
    }
};
