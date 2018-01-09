function execute(EventHandler, msg, params){
    return new Promise((resolve, reject) => {

        if(!("date-time" in params)){
            return reject({
                message: "No date or time specified. Try again."
            });
        }

        let date = EventHandler.createDate(params["date-time"]);
        let guild = "0";
        if(msg.guild) guild = msg.guild.id;

        EventHandler.Client.db.setEvent({
            execute_at: date.getTime(),
            guild_id: guild,
            channel_id: msg.channel.id,
            initiator_id: msg.author.id,
            action: "reminders",
            target_id: msg.author.id,
            data: JSON.stringify(params),
            status: "TODO"
        });

        resolve({
            message: "Reminder created!"
        });

    });
}

module.exports = {
    execute: execute
}
