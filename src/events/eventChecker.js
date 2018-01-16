const EventEmitter = require("events");

module.exports = class EventChecker extends EventEmitter {
    constructor(Client) {
        super();
        this.Client = Client;
        this.start();
    }

    start() {
        this.thread = setInterval(() => {
            this.fetchEvents();
        }, 1000);
    }

    fetchEvents() {
        this.Client.db.getEvent([
            ` AND events.execute_at < FROM_UNIXTIME(${Date.now()/1000})`,
            " AND events.status = \"TODO\""
        ]).then((events) => {
            if (events.length) {
                this.emit("events", events);
            }
        }).catch(() => {
            clearInterval(this.thread);
        });
    }
};
