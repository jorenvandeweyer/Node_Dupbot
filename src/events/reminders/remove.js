function execute(EventHandler, msg, params) {
    return new Promise((resolve, reject) => {

        let date = EventHandler.createDate(params["date-time"]);
        date;
        let guild = "0";
        if (msg.guild) guild = msg.guild.id;

        EventHandler.Client.db.getEvent([
            " AND events.action='reminders'",
            " AND events.status='TODO'",
            ` AND events.initiator_id='${msg.author.id}'`,
            // ` AND events.channel_id='${msg.channel.id}',`
            ` AND guilds.guild=${guild}`
        ]).then((result) => {
            let ids = result.map(row => row.id);
            if (ids.length === 0) return reject({message: "No reminders to remove"});
            EventHandler.Client.db.editEvent([
                ` AND id IN (${ids.join(",")})`
            ], "DELETE").then((result) => {
                resolve({
                    message: `Deleted ${result.affectedRows} reminders`
                });
            }).catch((err) => {
                reject(err);
            });
        }).catch(reject);
    });
}

module.exports = {
    execute: execute
};
