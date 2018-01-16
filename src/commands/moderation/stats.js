module.exports = {
    name: "stats",
    defaultPermission: 2,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {

        class Stats {
            constructor() {
                this.requests = 0;
                this.stats = {};
                this.started = Date.now();
                this.init();
            }

            init() {
                this.channels = msg.guild.channels.filter(x => x.type === "text");
                this.getStats();
            }

            async getStats() {
                await Client.db.getStats_users(msg.guild.id, "all").then(async (result) => {
                    if (result.length === 0) {
                        await this.fetchAllMessages();
                    } else {
                        let embed = new Client.RichEmbed();
                        let members = "";
                        let percentage = "";
                        let total = 0;

                        for (let i = 0; i < result.length; i++) {
                            total += result[i].value;
                        }
                        for (let i = 0; i < result.length; i++) {
                            if (i === 20) break;
                            members += `\n${i+1} - <@${result[i].user_id}>: ${result[i].value} messages`;
                            percentage += `\n ${((result[i].value/total)*100).toFixed(2)}%`;
                        }

                        embed.addField("Members with most sent messages", members,true);
                        embed.addField("Percentage", percentage,true);
                        embed.setTitle(`Sent messages (${total} messages)`);
                        embed.setDescription("\n");
                        embed.setColor(3447003);

                        Client.send(msg, embed);
                    }
                });
            }

            async fetchAllMessages() {
                Client.send(msg, Client.createEmbed("info", "<:empty:314349398723264512> Fetching messages <a:loading:393852367751086090>")).then(async (message) => {
                    for (let channel of this.channels) {
                        if (!channel[1].permissionsFor(msg.client.user).has("VIEW_CHANNEL")) continue;
                        await this.fetchAllMessagesChannel(channel[1], msg.guild.createdTimestamp);
                    }
                    message.edit(Client.createEmbed("succes", `<:check:314349398811475968> Finished, took ${(Date.now() - this.started) / 1000}seconds to fetch ${this.requests/10}k messages. Invoke the \`stats\` command again to see the result!`));

                    this.updateDatabase();
                });
            }

            async fetchAllMessagesChannel(channel, after) {
                await channel.fetchMessages({after: after, limit: 100}).then( async (messages) => {
                    Client.sys("log", `${channel.id}: ${this.requests}`);
                    this.requests++;

                    messages = messages.sort( (a, b) => {
                        return a.createdTimestamp - b.createdTimestamp;
                    });

                    for (let message of messages) {
                        let author = message[1].author.id;
                        if (!(author in this.stats)) {
                            this.stats[author] = 0;
                        }
                        this.stats[author]++;
                    }

                    if (messages.size === 100) {
                        await this.fetchAllMessagesChannel(channel, messages.lastKey());
                    }
                });
            }

            updateDatabase() {
                // let values = [];
                for (let id in this.stats) {
                    Client.db.setStats_users(msg.guild.id, id, "MSG_SENT", this.stats[id]);
                    // values.push([id, this.stats[id], "MSG_SENT"]);
                }

                // Client.db.executeStatement("INSERT INTO stats_" + msg.guild.id + " (id, value, type) VALUES ?", values).then((result) => {
                //     console.log(result);
                // });
            }
        }


        if (msg.params.includes("--reset") && msg.permissionLevel == 4) {
            Client.db.resetDatabase("stats_" + msg.guild.id);
        } else {
            new Stats(Client, msg);
        }
    }
};
