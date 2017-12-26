const request = require('request');
// const {gdax} = require("../../serverSettings.json");

const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient("BTC-EUR");

module.exports = {
    name: "btc",
    description: "btc",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){

        publicClient.getProductOrderBook((error, response, data) => {
          if (error) {
            console.log(error);
          } else {
              console.log(data);
              let gdaxData = new GdaxData(data);

              if(msg.params.includes("--convert")){
                  let index = msg.params.indexOf("--convert");
                  let value = msg.params[index+1];
                  let embed = new msg.client.Discord.RichEmbed();
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
                  self.send(msg, embed);

              } else if(msg.params.includes("--full")){
                  let embed = new msg.client.Discord.RichEmbed();
                  embed.setTitle("Bitcoin")
                    .setColor("RED")
                    .setDescription("Info fetched from Gdax")
                    .addField("Bid", `\`${gdaxData.bidAmount}\t${gdaxData.bid}\``)
                    .addField("Ask", `\`${gdaxData.askAmount}\t${gdaxData.ask}\``);

                  self.send(msg, embed);

              } else {
                  let embed = new msg.client.Discord.RichEmbed();
                  embed.setDescription(`**Bid:** ${gdaxData.bid} **Ask:** ${gdaxData.ask}`)
                    .setColor("RED");
                  self.send(msg, embed);
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
        return (value * (1/parseFloat(this.asks[0][0]))).toFixed(8);
    }

    BTCtoEUR(value){
        return (value * parseFloat(this.asks[0][0])).toFixed(2);
    }
}
