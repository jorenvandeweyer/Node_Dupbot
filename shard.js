const { ShardingManager } = require('discord.js');
const {token, dev_token} = require('./serverSettings.json');

let login_token;
let args = [];

if(!process.argv.includes("--dev")){
    login_token = token;
} else {
    login_token = dev_token;
    args.push("--dev");
}


const manager = new ShardingManager('./src/client.js', {
    token: login_token,
    shardArgs: args,
});

manager.spawn();
manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));
