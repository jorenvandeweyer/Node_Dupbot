const request = require('request');

module.exports = {
    name: "cat",
    description: "cat",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        request("http://random.cat/meow", (err, res, body) => {
            if(err) return console.log(err);
            self.send(msg, JSON.parse(body).file);
        });
    }
};
