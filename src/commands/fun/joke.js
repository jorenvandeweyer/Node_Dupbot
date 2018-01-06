const request = require('request');

module.exports = {
    name: "joke",
    description: "!joke",
    defaultPermission: 1,
    args: 0,
    execute(Client, msg){
        request(`https://icanhazdadjoke.com/`, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            Client.send(msg, body.joke);
        });
    }
};
