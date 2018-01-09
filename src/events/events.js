function handle(msg, action, params){
    let guild = "0";
    let date = new Date(params["date-time"]).getTime();

    if(msg.guild == undefined){
        guild = msg.guild.id;
    }

    switch (action) {
        case "reminders.add":

            EventHandler.Client.db.setEvent({
                execute_at: date,
                guild_id: guild,
                channel_id: msg.channel.id,
                initiator_id: msg.author.id,
                action: "remind",
                target_id: msg.author.id,
                data: JSON.stringify(params),
                status: "TODO"
            });
            break;
        default:

    }
    console.log(action, params);
}

let EventHandler = {
    eventChecker: require("./eventChecker"),
    start(Client){
        this.Client = Client
    },
    handle: handle
};

module.exports = EventHandler;
