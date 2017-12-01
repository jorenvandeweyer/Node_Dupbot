module.exports = {
    name: "graphs",
    description: "!graphs",
    defaultPermission: 1,
    usage: "<start> <end> (yyyy-mm-dd)",
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.graphs.get(self, msg);
    }
};
