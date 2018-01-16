const db = require("../../utils/database.js");

let dbFunctions = new Map();

for (let func in db) {
    if (typeof db[func] === "function") {
        dbFunctions.set(func, db[func]);
    }
}

module.exports = {
    name: "db",
    usage: "<query> || function",
    defaultPermission: 4,
    args: 1,
    guildOnly: false,
    execute (Client, msg) {
        if (dbFunctions.has(msg.params[0])) {
            let fun = msg.params.shift();
            if (msg.params.length >= dbFunctions.get(fun).length) {
                dbFunctions.get(fun)(...msg.params, Client);
                Client.send(msg, Client.createEmbed("succes", `${fun} was executedSuccesfully`));
            } else {
                Client.send(msg, Client.createEmbed("error", `${fun} requires atleast ${dbFunctions.get(fun).length} arguments`));
            }
        } else {
            db.con.query(msg.params.join(" "), (err, result) => {
                if (err) return Client.send(msg, Client.createEmbed("error", `${msg.params.join(" ")} is not a valid query or function`));
                if (result.length) {
                    result = result.map((x) => {
                        return JSON.stringify(x);
                    });
                    let message = result.join("\n");
                    if (message.length > 1900) {
                        message = message.slice(0, 1900) + "\n\n ...";
                    }
                    Client.send(msg, "```\n" + message + "\n```");
                }
            });
        }
    }
};
