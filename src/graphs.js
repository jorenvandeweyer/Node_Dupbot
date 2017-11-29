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
        members.delete(members.firstKey());

        let x_1 = [];
        let y_1 = [];
        let x_green = [];
        let y_green = [];
        let x_red = [];
        let y_red = [];

        let count = 0;

        for(key of members){
            count++;
            x_1.push(key[1].joinedAt.toISOString().replace("T", " ").split(".")[0]);
            y_1.push(count);

            let time = key[1].joinedAt.toISOString().split("T")[0]
            if(x_green.includes(time)){
                let index = x_green.indexOf(time);
                y_green[index]++;
            } else {
                x_green.push(time);
                y_green.push(1);
            }
        }


        createImage(x_1, y_1, (stream) => {
            let attachment = new Discord.Attachment(stream);
            self.send(msg, attachment);
        });

        self.db.getServerStats(msg.guild.id, "guildMemberRemove", (rows) => {

            for (let i = 0; i<rows.length; i++){
                let row = rows[i];

                let time = new Date(parseInt(row.timestamp))
                time = time.toISOString().split("T")[0];

                if(x_red.includes(time)){
                    let index = x_red.indexOf(time);
                    y_red[index]--;
                } else {
                    x_red.push(time);
                    y_red.push(-1);
                }

            }

            bars(x_green, y_green, x_red, y_red, (stream) => {
                let attachment = new Discord.Attachment(stream);
                self.send(msg, attachment);
            });
        });
    });

}

module.exports = {
    get: get
};
