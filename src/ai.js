const apiai = require('apiai');
const cleverbot = require("./cleverbot");

const {apiai_key} = require("../serverSettings.json");

const app = apiai(apiai_key);

function get(self, msg){
    let request = app.textRequest(convert(msg.input_ai), {
        sessionId: msg.author.id
    });

    request.on('response', function(response) {
        msg.params = [];
        for(key in response.result.parameters){
            if(response.result.parameters[key] !== ''){
                msg.params.push(response.result.parameters[key]);
            }
        }

        if(response.result.action){
            msg.command = response.result.action;
        }

        console.log(msg.command, msg.params);

        if(response.result.action == "input.unknown"){
            cleverbot.get(self, msg);
        } else if(response.result.fulfillment.speech){
            self.send(msg, convertBack(response.result.fulfillment.speech), () => {
                self.command.call(self, msg);
            });
        } else {
            self.command.call(self, msg);
        }
    });

    request.on('error', function(err){
        self.send(msg, "Something did go wrong :disappointed:");
    });

    request.end();
}

function convert(phrase){
    return phrase
     .replace(/<@&/g, "ROLEID")
     .replace(/<@/g, "USERID")
     .replace(/>/g, "SOMEIDEND");
}

function convertBack(phrase){
    return phrase
     .replace(/ROLEID/g, "<@&")
     .replace(/USERID/g, "<@")
     .replace(/SOMEIDEND/g, ">");
}

module.exports = {
    get: get
};
