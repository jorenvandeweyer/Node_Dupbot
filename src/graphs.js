const {plotly_username, plotly_apikey} = require("../serverSettings");
const Discord = require("discord.js");

var plotly = require('plotly')(plotly_username, plotly_apikey);

function createImage(x, y, _callback){
    var trace1 = {
        x: x,
        y: y,
        type: "scatter"
    };

    var layout = {
      xaxis: {
          showticklabels: true,
          tickangle: 45,
          tickfont: {
              family: "Old Standard TT, serif",
              size: 14,
              color: "black"
          },
          exponentformat: "e",
          showexponent: "All"
      },
      yaxis: {
          title: "#members",
          titlefont: {
              family: "Arial, sans-serif",
              size: 18,
              color: "black"
          },
          showticklabels: true,
          tickfont: {
              family: "Old Standard TT, serif",
              size: 14,
              color: "black"
          },
          exponentformat: "e",
          showexponent: "All"
      }
    };

    var figure = { 'data': [trace1], 'layout': layout };

    var imgOpts = {
        format: 'png',
        width: 3000,
        height: 1500
    };

    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);
        _callback(imageStream);
    });
}

function bars(x1, y1, x2, y2, _callback){
    var trace1 = {
        x: x1,
        y: y1,
        type: "bar",
        name: "Members Joined"
    };
    var trace2 = {
        x: x2,
        y: y2,
        type: "bar",
        name: "Members Left"
    };
    var layout = {
        xaxis: {
            showticklabels: true,
            tickangle: 45,
            tickfont: {
                family: "Old Standard TT, serif",
                size: 14,
                color: "black"
            },
            exponentformat: "e",
            showexponent: "All"
        },
        yaxis: {
            title: "#members",
            titlefont: {
                family: "Arial, sans-serif",
                size: 18,
                color: "black"
            },
            showticklabels: true,
            tickfont: {
                family: "Old Standard TT, serif",
                size: 14,
                color: "black"
            },
            exponentformat: "e",
            showexponent: "All"
        }
    };
    var figure = { 'data': [trace1, trace2], 'layout': layout};
    var imgOpts = {
        format: 'png',
        width: 3000,
        height: 1500
    };
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);
        _callback(imageStream);
    });
}

function get(self, msg){
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

                if(key[1].joinedTimestamp < creationTime) continue;
                if(key[1].joinedTimestamp >= firstRecord) break;

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
                    let time = new Date(parseInt(joins[i].timestamp));
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
                    let time = new Date(parseInt(leaves[i].timestamp))
                    time = time.toISOString().split("T")[0];

                    if(x_red.includes(time)){
                        let index = x_red.indexOf(time);
                        y_red[index]--;
                    } else {
                        x_red.push(time);
                        y_red.push(-1);
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

            bars(x_green, y_green, x_red, y_red, (stream) => {
                let attachment = new Discord.Attachment(stream);
                self.send(msg, attachment);
            });

            createImage(x_total, y_total_cum, (stream) => {
                let attachment = new Discord.Attachment(stream);
                self.send(msg, attachment);
            });
        });
    });

}

function getData(self, msg, _callback){
    self.db.getServerStats(msg.guild.id, "guildMemberAdd", (joins) => {
        self.db.getServerStats(msg.guild.id, "guildMemberRemove", (leaves) => {
            let firstRecord = Infinity;
            if(joins !== undefined && joins.length){
                firstRecord = joins[0].timestamp;
            }
            if(leaves !== undefined && leaves.length){
                let timestamp = leaves[0].timestamp;
                if(timestamp < firstRecord){
                    firstRecord = timestamp;
                }
            }
            _callback(joins, leaves, firstRecord);
        });
    });
}

module.exports = {
    get: get
};
