function execute(EventHandler, msg, params){
    return new Promise((resolve, reject) => {

        if(!("date-time" in params)){
            return reject({
                message: "No date or time specified. Try again."
            });
        }

        let date;
        if(params.correctDate){
            date = new Date(params["date-time"]);
        } else {
            date = EventHandler.createDate(params["date-time"]);
        }

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

        let time;
        if("original" in params){
            time = params.original;
        } else if("contexts" in params && params.contexts[0] &&  "date-time.original" in params.contexts[0].parameters){
            time = params.contexts[0].parameters["date-time.original"];
        } else {
            time = "at " + date.toString();
        }

        resolve({
            message: `Reminder created! I'll remind you ${time}`
        });

    });
}

module.exports = {
    execute: execute
}
