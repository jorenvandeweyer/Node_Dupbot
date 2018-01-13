const request = require('request');
// const {gdax} = require("../../serverSettings.json");

const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient("BTC-EUR");

module.exports = {
    name: "btc",
    description: "btc",
    usage: "< --full, --convert 10EUR, --stats, --buy BTC 20EUR, --sell 0.1BTC, --reset >",
    defaultPermission: 1,
    args: 0,
    execute(Client, msg){

        publicClient.getProductOrderBook((error, response, data) => {
          if (error) {
            console.log(error);
          } else {
              let gdaxData = new GdaxData(data);
              if(msg.params.includes("--stats")){
                  getInfo(Client, msg, (data) => {
                      let embed = new Client.RichEmbed();
                      embed.setColor("RED")
                      embed.setTitle("Trade stats for: " + msg.author.username)

                      let totalValue = 0;
                      for(type in data){
                          let title = "";
                          let value = "";
                          switch (type) {
                              case "start":
                                  title = "Start value";
                                  value = `User started with ${data[type]}EUR`;
                                  break;
                              case "EUR":
                                  title = "Euro";
                                  value = `User has ${data[type]}EUR`;
                                  totalValue+= parseFloat(data[type]);
                                  break;
                              case "BTC":
                                  title = "Bitcoins";
                                  value = `User has ${data[type]}BTC (=${gdaxData.BTCtoEUR(data[type])}EUR)`;
                                  totalValue+=parseFloat(gdaxData.BTCtoEUR(data[type]));
                                  break;
                              default:

                          }
                          embed.addField(title, value);
                      }
                      embed.setDescription(`This user has made ${(((totalValue/parseFloat(data["start"]))-1)*100).toFixed(2)}% profit`);
                      embed.addField("Total Value", `This user total value is ${totalValue.toFixed(2)}EUR`);
                      Client.send(msg, embed);
                  });
              } else if(msg.params.includes("--buy")){
                  let index = msg.params.indexOf("--buy");
                  let type = msg.params[index+1];
                  let amount = msg.params[index+2];
                  getInfo(Client, msg, (data) => {
                      let embed = new Client.RichEmbed();
                      embed.setColor("RED");

                      if(parseFloat(amount) <= parseFloat(data["EUR"])){
                          embed.setTitle("Buy");
                          embed.setDescription(`Bought \`${gdaxData.EURtoBTC(parseFloat(amount))}BTC\` for \`${parseFloat(amount).toFixed(2)}EUR\` \`(${gdaxData.ask})\``);

                          Client.db.setBtc(msg.guild.id, msg.author.id, "EUR", parseFloat(data["EUR"]) - parseFloat(amount));
                          Client.db.setBtc(msg.guild.id, msg.author.id, "BTC", parseFloat(data["BTC"]) + parseFloat(gdaxData.EURtoBTC(parseFloat(amount))));
                      } else {
                           embed.setTitle("Not enough funds");
                      }

                      Client.send(msg, embed);
                  });
              } else if(msg.params.includes("--sell")){
                  let index = msg.params.indexOf("--sell");
                  let value = msg.params[index+1];
                  getInfo(Client, msg, (data) => {
                      let embed = new Client.RichEmbed();
                      embed.setColor("RED");

                      if(parseFloat(value) <= parseFloat(data["BTC"])){
                          embed.setTitle("Sell");
                          embed.setDescription(`Sold \`${parseFloat(value).toFixed(8)}BTC\` for \`${gdaxData.BTCtoEUR(parseFloat(value))}EUR\`  \`(${gdaxData.bid})\``);

                          Client.db.setBtc(msg.guild.id, msg.author.id, "EUR", parseFloat(data["EUR"]) + parseFloat(gdaxData.BTCtoEUR(parseFloat(value))));
                          Client.db.setBtc(msg.guild.id, msg.author.id, "BTC", parseFloat(data["BTC"]) - parseFloat(value));
                      } else {
                           embed.setTitle("Not enough funds");
                      }

                      Client.send(msg, embed);
                  });
              } else if(msg.params.includes("--reset")){
                  let index = msg.params.indexOf("--reset");
                  let value = msg.params[index+1];
                  Client.db.setBtc(msg.guild.id, msg.author.id, "start", 100);
                  Client.db.setBtc(msg.guild.id, msg.author.id, "EUR", 100);
                  Client.db.setBtc(msg.guild.id, msg.author.id, "BTC", 0);
                  let embed = new Client.RichEmbed();
                  embed.setColor("RED")
                    .setTitle("Reset for user: " + msg.author.username);
                  Client.send(msg, embed);
              } else if(msg.params.includes("--convert")){
                  let index = msg.params.indexOf("--convert");
                  let value = msg.params[index+1];
                  let embed = new Client.RichEmbed();
                  embed.setColor("RED")

                  if(value.includes("EUR")){
                      value = parseFloat(value);
                      let bitcoin = gdaxData.EURtoBTC(value);
                      embed.setTitle("EURO TO BTC")
                        .setDescription(`€${value} equals ${bitcoin}BTC`);
                  } else if(value.includes("BTC")){
                      value = parseFloat(value);
                      let euro = gdaxData.BTCtoEUR(value);
                      embed.setTitle("BTC TO EURO")
                        .setDescription(`${value}BTC equals €${euro}`);
                  }
                  Client.send(msg, embed);

              } else if(msg.params.includes("--full")){
                  let embed = new Client.RichEmbed();
                  embed.setTitle("Bitcoin")
                    .setColor("RED")
                    .setDescription("Info fetched from Gdax")
                    .addField("Bid", `\`${gdaxData.bidAmount}\t${gdaxData.bid}\``)
                    .addField("Ask", `\`${gdaxData.askAmount}\t${gdaxData.ask}\``);

                  Client.send(msg, embed);

              } else {
                  let embed = new Client.RichEmbed();
                  embed.setDescription(`**Bid:** ${gdaxData.bid} **Ask:** ${gdaxData.ask}`)
                    .setColor("RED");
                  Client.send(msg, embed);
              }
          }
        });
    }
};

class GdaxData {
    constructor(data) {
        this.data = data;
        this.bids = data.bids;
        this.asks = data.asks;
    }

    get bid(){
        return parseFloat(this.bids[0][0]).toFixed(2);
    }

    get ask(){
        return parseFloat(this.asks[0][0]).toFixed(2);
    }

    get bidAmount(){
        return parseFloat(this.bids[0][1]).toFixed(8);
    }

    get askAmount(){
        return parseFloat(this.asks[0][1]).toFixed(8);
    }

    EURtoBTC(value){
        return (0.9975 * value * (1/parseFloat(this.asks[0][0]))).toFixed(8);
    }

    BTCtoEUR(value){
        return (0.9975 * value * parseFloat(this.bids[0][0])).toFixed(2);
    }
}

function getInfo(Client, msg, _callback){
    if(msg.channel.type !== "text") return;
    Client.db.getBtc(msg.guild.id, msg.author.id).then((data) => {
        if(data){
            let obj = {};
            for(let i = 0; i < data.length; i++){
                let row = data[i];
                obj[row.type] = row.value;
            }
            _callback(obj);
        } else {
            _callback(false);
        }
    });
}
