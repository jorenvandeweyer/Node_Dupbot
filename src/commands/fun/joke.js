const request = require("request");

module.exports = {
    name: "joke",
    defaultPermission: 1,
    args: 0,
    execute (Client, msg) {
        request("https://icanhazdadjoke.com/", { json: true }, (err, res, body) => {
            if (err) return Client.sys("error", err);
            Client.send(msg, body.joke);
        });
    }
};
