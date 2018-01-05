const ChartjsNode = require('chartjs-node');

let chartNodeB, chartNodeL;

function createGraphs(self, msg, start, end){
    let creationTime = msg.guild.createdTimestamp;
    msg.guild.fetchMembers().then( (guild) => {
        let members = guild.members.sort(function(a, b){return a.joinedTimestamp-b.joinedTimestamp});

        let x_green = [];
        let y_green = [];
        let x_red = [];
        let y_red = [];

        let x_total = [];
        let y_total = [];

        getData(self, msg, (joins, leaves, firstRecord) => {
            for(key of members){
                let time = key[1].joinedAt.toISOString().split("T")[0];

                let timestamp = key[1].joinedTimestamp;
                if(timestamp < creationTime || timestamp < start || timestamp > end) continue;
                if(timestamp >= firstRecord) break;

                if(x_green.includes(time)){
                    let index = x_green.indexOf(time);
                    y_green[index]++;
                } else {
                    x_green.push(time);
                    y_green.push(1);
                }
            }

            if(joins){
                for(let i = 0; i<joins.length; i++){
                    let timestamp = parseInt(joins[i].timestamp);
                    if(timestamp < start || timestamp > end) continue;

                    let time = new Date(timestamp);
                    time = time.toISOString().split("T")[0];

                    if(x_green.includes(time)){
                        let index = x_green.indexOf(time);
                        y_green[index]++;
                    } else {
                        x_green.push(time);
                        y_green.push(1);
                    }
                }
            }

            x_total = x_green.slice(0);
            y_total = y_green.slice(0);

            if(leaves){
                for (let i = 0; i<leaves.length; i++){
                    let timestamp = parseInt(leaves[i].timestamp);
                    if(timestamp < start || timestamp > end) continue;

                    let time = new Date(timestamp);
                    time = time.toISOString().split("T")[0];

                    if(x_red.includes(time)){
                        let index = x_red.indexOf(time);
                        y_red[index]++;
                    } else {
                        x_red.push(time);
                        y_red.push(1);
                    }

                    if(x_total.includes(time)){
                        let index = x_total.indexOf(time);
                        y_total[index]--;
                    } else {
                        x_total.push(time);
                        y_total.push(-1);
                    }

                }
            }

            let y_total_cum = [0];

            for(let i = 0; i < x_total.length; i++){
                y_total_cum[i+1] = y_total[i] + y_total_cum[i];
            }

            y_total_cum = y_total_cum.slice(1);

            createImageStreamB(x_green, y_green, y_red).then((stream) => {
                let attachment = new self.Discord.Attachment(stream);
                self.send(msg, attachment, () =>{
                    chartNodeB.destroy();
                });
            });

            createImageStreamL(x_total, y_total_cum).then((stream) => {
                let attachment = new self.Discord.Attachment(stream);
                self.send(msg, attachment, () =>{
                    chartNodeL.destroy();
                });
            });

        });
    });
}

function getData(self, msg, _callback){
    self.db.getServerStats(msg.guild.id, "guildMemberAdd", (joins) => {
        self.db.getServerStats(msg.guild.id, "guildMemberRemove", (leaves) => {
            let firstRecord = Infinity;
            if(joins.length){
                firstRecord = joins[0].timestamp;
            }
            if(leaves.length){
                let timestamp = leaves[0].timestamp;
                if(timestamp < firstRecord){
                    firstRecord = timestamp;
                }
            }
            _callback(joins, leaves, firstRecord);
        });
    });
}

function get(self, msg){
    let start = 0;
    let end = Infinity;
    if(msg.params.length >= 2){
        start = Date.parse(msg.params[0]);
        end = Date.parse(msg.params[1]) + 1*24*60*60*1000;

        if(start == NaN){
            start = 0;
        }
        if(end == NaN){
            end = Infinity;
        }
    }
    createGraphs(self, msg, start, end);
}

module.exports = {
    get: get
};

function createImageStreamL(dates, joins){
    chartNodeL = new ChartjsNode(800, 600);
    return chartNodeL.drawChart({
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    label: "First",
                    backgroundColor: 'rgba(53, 255, 53, 1)',
                    borderWidth: 1,
                    data: joins,
                    pointRadius: 0
                }
            ],
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    stacked: true,
                }],
                yAxes: [{
                    //stacked: false,
                    ticks: {
                        beginAtZero: true
                    },
                }]
            },
        }
    }).then(() => {
        return chartNodeL.getImageBuffer('image/png');
    });
}

function createImageStreamB(dates, joins, leaves){
    chartNodeB = new ChartjsNode(600, 600);
    return chartNodeB.drawChart({
        type: "bar",
        data: {
            labels: dates,
            datasets: [
                {
                    label: "Leaves",
                    backgroundColor: 'rgba(255, 53, 53, 1)',
                    borderWidth: 1,
                    data: leaves,
                }, {
                    label: "Joins",
                    backgroundColor: 'rgba(53, 255, 53, 1)',
                    borderWidth: 1,
                    data: joins,
                }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    stacked: true
                }],
                yAxes: [{
                    stacked: false,
                    ticks: {
                        beginAtZero: true
                    },
                }]
            }
        }
    }).then(() => {
        return chartNodeB.getImageBuffer('image/png');
    });
}
