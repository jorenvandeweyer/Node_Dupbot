module.exports = {
    name: "setstatus",
    usage: "<status>",
    defaultPermission: 4,
    args: 1,
    execute (Client, msg) {
        if (msg.params.length <= 0) return;
        Client.bot.user.setActivity(msg.params.join(" ")).then(() => {
            Client.send(msg, Client.createEmbed("succes", "Status changed"));
        }).catch((e) => {
            Client.Logger.error(`Shard[${Client.shard.id}]: ${e}`);
        });
    }
};
