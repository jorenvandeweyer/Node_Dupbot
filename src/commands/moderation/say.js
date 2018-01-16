module.exports = {
    name: "say",
    usage: "<channel> <text>",
    defaultPermission: 2,
    failPermission: "You can't say things",
    args: 1,
    execute (Client, msg) {
        let channel = Client.extractChannel(msg, 0);
        if (channel) {
            msg.params.shift();
            let message = Client.createEmbed("info", msg.params.join(" "));
            Client.sendChannel(msg, channel.id, message);
        } else {
            let message = Client.createEmbed("info", msg.params.join(" "));
            Client.send(msg, message);
        }
    }
};
