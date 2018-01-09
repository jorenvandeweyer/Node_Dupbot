function execute(EventHandler, event){
    return new Promise((resolve, reject) => {
        let data = JSON.parse(event.data);

        let channel = EventHandler.Client.bot.channels.get(event.channel_id);
        if(channel.type === "text" && !channel.permissionsFor(EventHandler.Client.bot.user).has("SEND_MESSAGES")){
            return reject();
        };

        let embed = new EventHandler.Client.Discord.RichEmbed();

        embed.setTitle("Reminder");
        embed.setColor(16776960);
        if(data.name){
            embed.setDescription(`I had to remind you to: \`${data.name}\``);
        }

        channel.send(`<@${event.target_id}>`, embed).then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
}

module.exports = {
    execute: execute
};
