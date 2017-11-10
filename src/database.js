const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/../data/dupbot');
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
        db.run("UPDATE permissions_" + guild + " SET value=$value WHERE command=$command", {
            $value: value,
            $command: command
        }, () => {
            //console.log("update");
        });
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
            console.log("update");
        });
    }
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

                db.each("SELECT * FROM permissions_" +guild, (err, rows) => {
                    console.log(rows);
                })
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
}

exports.close = function(){
    db.close();
}
