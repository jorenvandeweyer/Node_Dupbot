module.exports = {
    name: "graphs",
    description: "!graphs",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        self.graphs.get(self, msg);
    }
};
