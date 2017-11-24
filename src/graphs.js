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
        width: 1000,
        height: 500
    };

    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);
        _callback(imageStream);
    });
}

function bars(x, y, _callback){
    var trace1 = {
        x: x,
        y: y,
        type: "bar",
        name: "Members Joined"
    };
    var trace2 = {
        x: x,
        y: y,
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
        width: 1000,
        height: 500
    };
    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);
        _callback(imageStream);
    });
}

function get(self, msg){
    let creationTime = msg.guild.createdTimestamp;
    let members = msg.guild.members;

    members = members.sort(function(a, b){return a.joinedTimestamp-b.joinedTimestamp});
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

        if(x_green.includes(key[1].joinedAt.toISOString().split("T")[0])){
            let index = x_green.indexOf(key[1].joinedAt.toISOString().split("T")[0]);
            y_green[index]++;
        } else {
            x_green.push(key[1].joinedAt.toISOString().split("T")[0]);
            y_green.push(1);
        }
    }
    createImage(x_1, y_1, (stream) => {
        let attachment = new Discord.Attachment(stream);
        self.send(msg, attachment);
    });
    bars(x_green, y_green, (stream) => {
        let attachment = new Discord.Attachment(stream);
        self.send(msg, attachment);
    });
}

module.exports = {
    get: get
};
