const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/../data/database');
const settings = require(__dirname + '/../data/default');

exports.setup = function(self, guilds){
    for (let guild of guilds){
        addGuild(self, guild[0]);
    }
}

exports.add = function(self, guild){
    addGuild(self, guild);
}

exports.getPermissions = function(guild, command, _callback){
    if(command == "allPermissions"){
        db.all("SELECT * FROM permissions_" + guild, (err, rows) => {
            _callback(rows);
        });
    } else {
        db.get("SELECT value FROM permissions_" + guild + " WHERE command='" + command + "'", (err, row) => {
            if(row){
                _callback(row.value);
            } else {
                _callback(undefined);
            }
        });
    }
}

exports.setPermissions = function(guild, command, value){
        db.get("SELECT value FROM permissions_" + guild + " WHERE command='" + command + "'", (err, row) => {
            if(row == undefined) return;
            if(row.value < 4){
                db.run("UPDATE permissions_" + guild + " SET value=$value WHERE command=$command", {
                    $value: value,
                    $command: command
                }, () => {
                    //console.log("update");
                });
            }
        });
}

exports.getSettings = function(guild, setting, _callback){
    if(setting == "allSettings"){
        db.all("SELECT * FROM settings_" + guild, (err, rows) => {
            _callback(rows);
        });
    } else {
        db.get("SELECT value FROM settings_" + guild + " WHERE setting='" + setting + "'", (err, row) => {
            if(row){
                _callback(row.value);
            } else {
                _callback(undefined);
            }
        })
    }
}

exports.setSettings = function(guild, setting, value, _callback){
    if(setting in settings){
        db.run("UPDATE settings_" + guild + " SET value=$value WHERE setting=$setting", {
            $value: value,
            $setting: setting
        }, () => {
            if (typeof _callback === "function") _callback();
            //console.log("update");
        });
    }
}

exports.getStats_cah = function(guild, player, _callback){
    if(player == "top25"){
        db.all("SELECT * FROM stats_cah_" + guild + " ORDER BY points DESC LIMIT 25", (err, rows) => {
            _callback(rows);
        });
    } else {
        db.get("SELECT * FROM stats_cah_" + guild + " WHERE id='" + player + "'", (err, row) => {
            if(row){
                _callback(row);
            } else {
                _callback(false);
            }
        })
    }
}

exports.setStats_cah = function(guild, player, points){
    db.get("SELECT * FROM stats_cah_" + guild + " WHERE id='" + player + "'", (err, row) => {
        if(row){
            db.run("UPDATE stats_cah_" + guild + " SET points=$points WHERE id=$player", {
                $points: points + parseInt(row.points),
                $player: player,
            }, () => {
                //console.log("update");
            })
        } else {
            db.run("INSERT INTO stats_cah_" + guild + " VALUES ('" + player + "', 1)");
        }
    })

}

exports.getServerStats = function(guild, type, _callback){
    db.all("SELECT * FROM serverStats_" + guild + " WHERE type='" + type + "' ORDER BY timestamp ASC", (err, rows) => {
        _callback(rows);
    });
}

exports.setServerStats = function(guild, type, value){
    db.run("INSERT INTO serverStats_" + guild + " VALUES ($type, $timestamp, $value)", {
        $type: type,
        $timestamp: + new Date(),
        $value: value
    }, () => {
        console.log(type);
    });
}

function addGuild(self, guild){
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_" + guild + "'", (err, rows) => {
        let db_tables = [];
        for( let i = 0; i < rows.length; i++){
            db_tables.push(rows[i].name);
        }

        if(db_tables.includes("permissions_" + guild)){
            db.all("SELECT * FROM permissions_" + guild, (err, rows) => {
                if(rows){
                    db.serialize( () => {
                        let stmt = db.prepare("INSERT INTO permissions_" + guild + " VALUES (?,?)");

                        let db_commands = [];
                        for(let i = 0; i < rows.length; i++){
                            db_commands.push(rows[i].command)
                        }
                        for (let command of self.bot().commands){
                            if (!db_commands.includes(command[0])){
                                console.log(command[0]);
                                stmt.run(command[0], command[1].defaultPermission);
                            }
                        }

                        stmt.finalize()
                    });
                }
            });
        } else {
            db.serialize( () => {
                db.run("CREATE TABLE permissions_" + guild + " (command TEXT PRIMARY KEY, value INT)");

                let stmt = db.prepare("INSERT INTO permissions_" + guild + " VALUES (?,?)");

                for (let command of self.bot().commands){
                    stmt.run(command[0], command[1].defaultPermission);
                }

                stmt.finalize();
            });
        }

        if(db_tables.includes("settings_" + guild)){
            db.all("SELECT * FROM settings_" + guild, (err, rows) => {
                if(rows){
                    db.serialize( () => {
                        let stmt = db.prepare("INSERT INTO settings_" + guild + " VALUES (?,?)");

                        let db_settings = [];
                        for(let i = 0; i < rows.length; i++){
                            db_settings.push(rows[i].setting)
                        }
                        for(setting in settings){
                            if(!db_settings.includes(setting)){
                                console.log(setting);
                                stmt.run(setting, settings[setting]);
                            }
                        }

                        stmt.finalize();
                    });
                }
            });
        } else {
            db.serialize( () => {
                db.run("CREATE TABLE settings_" + guild + " (setting TEXT PRIMARY KEY, value TEXT)");

                let stmt = db.prepare("INSERT INTO settings_" + guild + " VALUES (?, ?)");

                for (key in settings){
                    stmt.run(key, settings[key]);
                }

                stmt.finalize();
            });
        }

        if(!db_tables.includes("stats_cah_" + guild)){
            db.serialize( () => {
                db.run("CREATE TABLE stats_cah_" + guild + " (id TEXT PRIMARY KEY, points INT)");
            });
        }

        if(!db_tables.includes("serverStats_" + guild)){
            db.serialize( () => {
                db.run("CREATE TABLE serverStats_" + guild + " (type TEXT, timestamp TEXT, value TEXT)");
            });
        }

    });
}

exports.close = function(){
    db.close();
}
