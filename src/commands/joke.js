const request = require('request');

module.exports = {
    name: "joke",
    description: "!joke",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        request(`https://icanhazdadjoke.com/`, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            self.send(msg, body.joke);
        });
    }
};
