function execute(EventHandler, msg, params){
    return new Promise((resolve, reject) => {

        let date;
        if(params.correctDate){
            date = new Date(params["date-time"]);
        } else {
            date = EventHandler.createDate(params["date-time"]);
        }

        let guild = "0";
        if(msg.guild) guild = msg.guild.id;

        EventHandler.Client.db.getEvent([
            " AND events.action='reminders'",
            " AND events.status='TODO'",
            ` AND events.initiator_id='${msg.author.id}'`,
            ` AND events.channel_id='${msg.channel.id}'`
        ]).then((result) => {

            let message = result.map((row) => {
                let data = JSON.parse(row.data);
                let text = row.execute_at;
                if(data.name) {
                    text += ": `" + data.name + "`";
                } else {
                    text += ": `You asked me to remind you`";
                }
                return text;
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
