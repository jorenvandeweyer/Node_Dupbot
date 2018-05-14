const { ShardingManager } = require("discord.js");
const { token } = require("./serverSettings.json");
const Logger = require("./src/utils/logger");

let args = [];

const map = new Map();

const manager = new ShardingManager("./src/client.js", {
    token,
    shardArgs: args,
});

manager.spawn();
manager.on("launch", shard => Logger.success(`Shard[X]:[+]Launched Shard[${shard.id}]`));

manager.on("message", (shard, message) => {
    if (message.type === "log") {
        Logger.log(`Shard[${shard.id}]:${message.info}`);
    } else if (message.type === "reload") {
        map.set(shard.id, message.msg);
    } else if (message.type === "connected") {
        if (map.has(shard.id)) {
            shard.eval(`this.channels.get('${map.get(shard.id).channel}').fetchMessage('${map.get(shard.id).id}').then(message => {message.edit({embed:{color:4193355, description:"<:check:314349398811475968>"}})})`);
            map.delete(shard.id);
        }
    }
});
