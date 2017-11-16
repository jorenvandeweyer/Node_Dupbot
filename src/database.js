const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/../data/database');
const commands = require('./commands/commands');
const settings = require(__dirname + '/../data/default');

exports.setup = function(guilds){
    for (guild of guilds){
        addGuild(guild[0]);
    }
}

exports.add = function(guild){
    addGuild(guild);
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
    if(command in commands && value >= 0 && value < 5){
        db.get("SELECT value FROM permissions_" + guild + " WHERE command='" + command + "'", (err, row) => {
            if(row.value < 4){
                db.run("UPDATE permissions_" + guild + " SET value=$value WHERE command=$command", {
                    $value: value,
                    $command: command
                }, () => {
                    //console.log("update");
                });
            }
        })
    }
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

exports.setSettings = function(guild, setting, value){
    if(setting in settings){
        db.run("UPDATE settings_" + guild + " SET value=$value WHERE command=$command", {
            $value: value,
            $setting: setting
        }, () => {
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
        console.log("-----row:");
        console.log(row);
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

function addGuild(guild){
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='permissions_" + guild + "'", (err, row) => {
        if(row == undefined){
            db.serialize( () => {
                db.run("CREATE TABLE permissions_" + guild + " (command TEXT PRIMARY KEY, value INT)");

                let stmt = db.prepare("INSERT INTO permissions_" + guild + " VALUES (?,?)");

                for (key in commands){
                    stmt.run(key, commands[key].defaultPermission);
                }

                stmt.finalize();
            });
        } else {
            db.all("SELECT * FROM permissions_" + guild, (err, rows) => {
                if(rows){
                    db.serialize( () => {
                        let stmt = db.prepare("INSERT INTO permissions_" + guild + " VALUES (?,?)");

                        let db_commands = [];
                        for(let i = 0; i < rows.length; i++){
                            db_commands.push(rows[i].command)
                        }
                        for(command in commands){
                            if (db_commands.indexOf(command) < 0){
                                stmt.run(command, commands[command].defaultPermission);
                                console.log(command);
                            }
                        }
                        // for (command in commands){
                        //     let addObject = true;
                        //     for(let i = 0; i < rows.length ;i++){
                        //         if(command == rows.command){
                        //             addObject = false;
                        //             break;
                        //         }
                        //     }
                        //     if(addObject){
                        //         stmt.run(command, commands[key].defaultPermission);
                        //     }
                        // }

                        stmt.finalize()
                    });
                }
            });
        }
    });
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='settings_" + guild + "'", (err, row) => {
        if(row == undefined){
            db.serialize( () => {
                db.run("CREATE TABLE settings_" + guild + " (settings TEXT PRIMARY KEY, value TEXT)");

                let stmt = db.prepare("INSERT INTO settings_" + guild + " VALUES (?, ?)");

                for (key in settings){
                    stmt.run(key, settings[key]);
                }

                stmt.finalize();
            });
        }
    });
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='stats_cah_" + guild + "'", (err, row) => {
        if(row == undefined){
            db.serialize( () => {
                db.run("CREATE TABLE stats_cah_" + guild + " (id TEXT PRIMARY KEY, points INT)");
            });
        }
    });
}

exports.close = function(){
    db.close();
}
