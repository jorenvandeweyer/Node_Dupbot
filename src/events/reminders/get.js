function execute(EventHandler, msg, params){
    return new Promise((resolve, reject) => {

        let date = EventHandler.createDate(params["date-time"]);
        let guild = "0";
        if(msg.guild) guild = msg.guild.id;

        EventHandler.Client.db.getEvent([
            " AND events.action='reminders'",
            " AND events.status='TODO'",
            ` AND events.initiator_id='${msg.author.id}'`,
            ` AND events.channel_id='${msg.channel.id}'`
        ]).then((result) => {
            let message = result.map((row) => {
                return row.execute_at + ": " + JSON.parse(row.data).name;
            }).join("\n");
            let embed = EventHandler.Client.createEmbed("info", message, "Reminders");
            if(msg.channel.type === "text" && !msg.channel.permissionsFor(msg.client.user).has("SEND_MESSAGES")) return;
            msg.channel.send(embed).then(resolve, reject);
        }).catch(reject);
    });
}

module.exports = {
    execute: execute
}
