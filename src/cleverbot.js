const request = require('request');

const {cleverbot} = require('../serverSettings.json');

function get(self, msg){
    request(`https://www.cleverbot.com/getreply?key=${cleverbot}&conversation_id=${msg.author.id}&input=${encodeURIComponent(msg.input_ai)}`, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        self.send(msg, body.output);
    });
}

module.exports = {
    get: get,
}
