module.exports = {
    name: "nuke",
    usage: "<amount>",
    defaultPermission: 3,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        let messageLimit = 50;

        if (msg.params.length >= 1) {
            messageLimit = msg.params[0];
        }

        msg.channel.bulkDelete(messageLimit).catch(() => {
            //check for permissions
            Client.send(msg, Client.createEmbed("fail", "Amount must be a number between 2 and 100"));
        });
    }
};
