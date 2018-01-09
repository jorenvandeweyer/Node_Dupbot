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
            let ids = result.map(row => row.id);
            EventHandler.Client.db.editEvent([
                ` AND id IN (${ids.join(",")})`
            ], "DELETE").then((result) => {
                resolve({
                    message: `Deleted ${result.affectedRows} reminders`
                });
            }).catch((err) => {
                    console.log(err);
                    reject(err);
            });
        }).catch(reject);
    });
}

module.exports = {
    execute: execute
}
