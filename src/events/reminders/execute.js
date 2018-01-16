function execute(EventHandler, event) {
    return new Promise((resolve, reject) => {
        let data = JSON.parse(event.data);

        let channel = EventHandler.Client.bot.channels.get(event.channel_id);
        if (channel.type === "text" && !channel.permissionsFor(EventHandler.Client.bot.user).has("SEND_MESSAGES")) {
            return reject();
        }

        let embed = new EventHandler.Client.RichEmbed();

        embed.setTitle("Reminder");
        embed.setColor(16776960);
        if (data.name) {
            embed.setDescription(`You asked me to remind you about:\n\n\`${data.name}\``);
        } else {
            embed.setDescription("You asked me to remind you.");
        }
        embed.setFooter(`Created: ${event.created_at}`);

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
