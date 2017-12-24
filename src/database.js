const mysql = require('mysql');
const settings = require(__dirname + '/../data/default');
const {mysql_host, mysql_user, mysql_pswd, mysql_db} = require("../serverSettings.json");

const con = mysql.createConnection({
  host: mysql_host,
  user: mysql_user,
  password: mysql_pswd,
  database: mysql_db
});

function setup(self, guilds){
    con.connect(function(err) {
        if (err) throw err;
        startUp();
        for(let guild of guilds){
            addGuild(self, guild[0]);
        }
    });
}

function startUp(){
    con.query("SELECT table_name FROM information_schema.tables where table_schema='" + mysql_db + "' and table_name='botStats'", (err, result) => {
        if(err) throw err;
        if(result[0] == undefined){
            con.query("CREATE TABLE botStats (stat CHAR(64) PRIMARY KEY, value BIGINT(255))", (err, result) => {
                con.query("INSERT INTO botStats VALUE ('messages', 0)");
            });
        }
    });
}

function addGuild(self, guild){
    con.query("SELECT table_name FROM information_schema.tables WHERE table_schema='" + mysql_db + "' AND table_name LIKE '%_" + guild + "'", (err, result) => {
        let db_tables = [];
        if(result.length){
            for(let i = 0; i < result.length; i++){
                db_tables.push(result[i].table_name);
            }
        }
        if(db_tables.includes("permissions_" + guild)){
            con.query("SELECT * FROM permissions_" + guild, (err, result) => {
                let sql = "INSERT INTO permissions_" + guild + " VALUES ?";
                let values = [];

                let db_commands = [];

                if(result.length){
                    for(let i = 0; i < result.length; i++){
                        db_commands.push(result[i].command);
                    }
                }

                for(let command of self.bot().commands){
                    if(!db_commands.includes(command[0])){
                        console.log("[db]" + command[0]);
                        values.push([command[0], command[1].defaultPermission]);
                    }
                }
                if(values.length){
                    con.query(sql, [values], (err, result) => {
                        if (err) throw err;
                        console.log("[db]Number of records inserted: " + result.affectedRows);
                    });
                }
            });
        } else {
            con.query("CREATE TABLE permissions_" + guild + " (command CHAR(64) PRIMARY KEY, value INT(3))", (err, result) => {
                let sql = "INSERT INTO permissions_" + guild + " VALUES ?";
                let values = [];

                for(let command of self.bot().commands){
                    values.push([command[0], command[1].defaultPermission]);
                }

                con.query(sql, [values], (err, result) => {
                    if(err) throw err;
                    console.log("[db]Number of records inserted: " + result.affectedRows);
                });
            });
        }

        if(db_tables.includes("settings_" + guild)){
            con.query("SELECT * FROM settings_" + guild, (err, result) => {
                let sql = "INSERT INTO settings_" + guild + " VALUES ?";
                let db_settings = [];
                let values = [];

                if(result.length){
                    for(let i = 0; i < result.length; i++){
                        db_settings.push(result[i].setting);
                    }
                }

                for(setting in settings){
                    if(!db_settings.includes(setting)){
                        console.log("[db]" + setting);
                        values.push([setting, settings[setting]]);
                    }
                }
                if(values.length){
                    con.query(sql, [values], (err, result) => {
                        if(err) throw err;
                        console.log("[db]Number of records inserted: " + result.affectedRows);
                    });
                }
            });
        } else {
            con.query("CREATE TABLE settings_" + guild + " (setting CHAR(64) PRIMARY KEY, value TEXT)", (err, result) => {
                let sql = "INSERT INTO settings_" + guild + " VALUES ?";
                let values = [];

                for(let setting in settings){
                    values.push([setting, settings[setting]]);
                }

                con.query(sql, [values], (err, result) => {
                    if(err) throw err;
                    console.log("[db]Number of records inserted: " + result.affectedRows);
                });
            });
        }

        if(!db_tables.includes("stats_cah_" + guild)){
            con.query("CREATE TABLE stats_cah_" + guild + "(id INT(32), points INT(16))", (err, result) => {
                //nothing
            });
        }

        if(!db_tables.includes("serverStats_" + guild)){
            con.query("CREATE TABLE serverStats_" + guild + " (type CHAR(64), timestamp char(32), value char(32))", (err, result) => {
                //nothing
            });
        }
    });
}

function getPermissions(guild, command, _callback){
    if(command == "allPermissions"){
        con.query("SELECT * FROM permissions_" + guild, (err, result) => {
            if(err) throw err;
            _callback(result);
        });
    } else {
        con.query("SELECT value FROM permissions_" + guild + " WHERE command='" + command +"'", (err, result) => {
            if(err) throw err;
            if(result.length){
                _callback(result[0].value);
            } else {
                _callback(undefined);
            }
        });
    }
}

function setPermissions(guild, command, value){
    con.query("SELECT value FROM permissions_" + guild + " WHERE command='" + command + "'", (err, result) => {
        if(err) throw err;
        if(result.length == 0) return;
        if(result[0].value < 4){
            con.query("UPDATE permissions_" + guild + " SET value=" + value + " WHERE command='" + command + "'", (err, result) => {
                if(err) throw err;
                console.log("update");
            });
        }
    });
}

function getSettings(guild, setting, _callback){
    if(setting == "allSettings"){
        con.query("SELECT * FROM settings_" + guild, (err, result) => {
            if(err) throw err;
            _callback(result);
        });
    } else {
        con.query("SELECT * FROM settings_" + guild + " WHERE setting='" + setting + "'", (err, result) => {
            if(err) throw err;
            if(result.length){
                _callback(result[0].value);
            } else {
                _callback(undefined);
            }
        });
    }
}

function setSettings(guild, setting, value, _callback){
    if(setting in settings){
        con.query("UPDATE settings_" + guild + " SET value='" + value + "' WHERE setting='" + setting + "'", (err, result) => {
            if(err) throw err;
            if(typeof _callback === "function") _callback();
        });
    }
}

function getStats_cah(guild, player, _callback){
    if(player == "top25"){
        con.query("SELECT * FROM stats_cah_" + guild + " ORDER BY points DESC LIMIT 25", (err, result) => {
            if(err) throw err;
            _callback(result);
        });
    } else {
        con.query("SELECT * FROM stats_cah_" + guild + " WHERE id=" + player, (err, result) => {
            if(err) throw err;
            if(result.length){
                _callback(result[0]);
            } else {
                _callback(false);
            }
        });
    }
}

function setStats_cah(guild, player, points){
    con.query("SELECT * FROM stats_cah_" + guild + " WHERE id='" + player + "'", (err, result) => {
        if(err) throw err;
        if(result.length){
            con.query("UPDATE stats_cah_" + guild + " SET points=points+" + points + " WHERE id=" +player, (err, result) => {
                if(err) throw err;
                console.log("update stats_cah");
            });
        } else {
            con.query("INSERT INTO stats_cah_" + guild + " SET ?", {
                id: player,
                points: points
            }, (err, result) => {
                if(err) throw err;
                console.log("update stats_cah");
            });
        }
    })
}

function getServerStats(guild, type, _callback){
    con.query("SELECT * FROM serverStats_" + guild + " WHERE type='" + type + "' ORDER BY timestamp ASC", (err, result) => {
        if(err) throw err;
        console.log("type:", type);
        _callback(result);
    });
}

function setServerStats(guild, type, value){
    let timestamp = new Date().getTime();
    con.query("INSERT INTO serverStats_" + guild + " SET ?", {
        type: type,
        timestamp: timestamp.toString(),
        value: value
    }, (err, result) => {
        if(err) throw err;
        console.log(type);
    });
}

function getBotStats(stat, _callback){
    con.query("SELECT value FROM botStats WHERE stat='" + stat + "'", (err, result) => {
        if(err) throw err;
        if(result.length){
            _callback(result[0].value);
        } else {
            _callback(undefined);
        }
    });
}

function setBotStats(stat, value){
    con.query("UPDATE botStats SET value=value+1 WHERE stat='" + stat + "'", (err, result) => {
        if(err) throw err;
        //nothing
    });
}

function executeStatement(statement, opts, _callback){
    con.query(statement, [opts], (err, result) => {
        if(err) throw err;
        _callback(result);
        console.log("[db]Number of records inserted: " + result.affectedRows);
    });
}

module.exports = {
    executeStatement: executeStatement,
    setup: setup,
    addGuild: addGuild,
    getPermissions: getPermissions,
    setPermissions: setPermissions,
    getSettings: getSettings,
    setSettings: setSettings,
    getStats_cah: getStats_cah,
    setStats_cah: setStats_cah,
    getServerStats: getServerStats,
    setServerStats: setServerStats,
    getBotStats: getBotStats,
    setBotStats: setBotStats
};
