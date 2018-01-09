const EventChecker = require("./eventChecker");
const fs = require('fs');

class EventHandler{
    constructor(){
        this.events = new Map();
        this.events.set("reminders", setup_reminders());
    }

    start(Client){
        this.Client = Client;
        this.eventChecker = new EventChecker(Client);
        this.eventChecker.on("events", (events) => {
            for(let i = 0; i < events.length; i++){
                this.setStatus(events[i].id, "BUSY");
                this.execute(events[i]);
            }
        });
    }

    process(msg, action, params){
        action = action.split(".");
        if(this.events.has(action[0])){
            if(this.events.get(action[0]).has(action[1])){
                this.events.get(action[0]).get(action[1]).execute(this, msg, params).then((feedback) => {
                    this.Client.send(msg, this.Client.createEmbed("info", feedback.message));
                }).catch((error) => {
                    this.Client.send(msg, this.CLient.createEmbed("fail", error.message));
                });
            }
        }
    }

    execute(event){
        if(this.events.has(event.action)){
            this.events.get(event.action).get("execute").execute(this, event).then((feedback) => {
                this.setStatus(event.id, "DONE");
            }).catch((error) => {
                this.setStatus(event.id, "FAIL");
            })
        }
    }

    setStatus(id, status){
        this.Client.db.updateEvent(id, status);
    }

    createDate(string){
        let date_time = string.replace("Z", " ").split("T");
        let date_params = {};

        if(date_time.length === 2){
            date_params.day = date_time[0];
            date_params.time = date_time[1];
        } else {
            if(date_time[0].includes("-")){
                date_params.day = date_time[0];
            } else if(date_time[0].includes(":")){
                date_params.time = date_time[0];
            }
        }

        let date = new Date();

        if("day" in date_params){
            let day = date_params.day.split("-");
            date.setFullYear(day[0]);
            date.setMonth(parseInt(day[1]) - 1);
            date.setDate(day[2]);
        }
        if("time" in date_params){
            let time = date_params.time.split(":");
            date.setHours(time[0]);
            date.setMinutes(time[1]);
            date.setSeconds(time[2]);
        }

        return date;
    }
}

module.exports = new EventHandler();

function setup_reminders(){
    let reminders = new Map();

    let files = fs.readdirSync(`${__dirname}/reminders`);
    for(let file of files){
        reminders.set(file.split(".")[0], require(`${__dirname}/reminders/${file}`));
    }
    return reminders;
}
