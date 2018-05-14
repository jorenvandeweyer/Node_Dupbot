const Request = require("request");

function set(Client) {
    Request.post(`https://bots.discord.pw/api/bots/${Client.bot.user.id}/stats`, {
        headers : {
            "Authorization" : Client.serverSettings.discordbotsapi
        },
        json: true,
        body: {"server_count": Client.bot.guilds.size}
    }, (err) => {
        if (err) return Client.Logger.error(`Shard[${Client.shard.id}]: discordbotapi error?`);
        // console.log(`[+]${Client.bot.guilds.size} guilds connected.`);
    });

    Request.post(`https://discordbots.org/api/bots/${Client.bot.user.id}/stats`, {
        headers : {
            "Authorization" : Client.serverSettings.discordbotsapi2
        },
        json: true,
        body: {"server_count": Client.bot.guilds.size}
    }, (err) => {
        if (err) return Client.Logger.error(`Shard[${Client.shard.id}]: discordbotapi error?`);
        // console.log(`[+]${Client.bot.guilds.size} guilds connected.`);
    });
}

module.exports = {
    set: set
};
