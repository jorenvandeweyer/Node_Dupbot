CREATE TABLE commands (
    `command_id` INT UNSIGNED AUTO_INCREMENT,
    `command` VARCHAR(64) UNIQUE,
    `permissions_default` INT UNSIGNED,
    PRIMARY KEY (`command_id`)
);

CREATE TABLE guilds (
    `guild_id` INT UNSIGNED AUTO_INCREMENT,
    `guild` VARCHAR(32) UNIQUE,
    PRIMARY KEY (`guild_id`)
);

CREATE TABLE settings_default (
    `setting_id` INT UNSIGNED AUTO_INCREMENT,
    `setting`VARCHAR(64) UNIQUE,
    `value_default` TEXT,
    PRIMARY KEY (`setting_id`)
);

CREATE TABLE stats_bot (
    `stat` VARCHAR(64),
    `value` BIGINT(255),
    PRIMARY KEY (`stats`)
);

CREATE TABLE permissions (
    `guild_id` INT UNSIGNED,
    `command_id` INT UNSIGNED,
    `value` INT UNSIGNED,
    FOREIGN KEY (`command_id`) REFERENCES commands(`command_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE `combined_index` (`guild_id`, `command_id`)
);

CREATE TABLE settings (
    `guild_id` INT UNSIGNED,
    `setting_id` INT UNSIGNED,
    `value` TEXT,
    FOREIGN KEY (`setting_id`) REFERENCES settings_default(`setting_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE `combined_index` (`guild_id`, `setting_id`)
);

CREATE TABLE stats_cah (
    `guild_id` INT UNSIGNED,
    `user_id` VARCHAR(32),
    `points` INT UNSIGNED,
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE `combined_index` (`guild_id`, `user_id`)
);

CREATE TABLE stats_guild (
    `guild_id` INT UNSIGNED,
    `type` VARCHAR(64),
    `timestamp` VARCHAR(32),
    `value` VARCHAR(32),
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE stats_users (
    `guild_id` INT UNSIGNED,
    `user_id` VARCHAR(32),
    `value` INT UNSIGNED,
    `type` VARCHAR(16),
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE `combined_index` (`guild_id`, `user_id`)
);

CREATE TABLE modlog (
    `id` INT UNSIGNED AUTO_INCREMENT,
    `guild_id` INT UNSIGNED,
    `user` VARCHAR(32),
    `type` VARCHAR(16),
    `mod` VARCHAR(32),
    `timestamp` VARCHAR(32),
    `reason` VARCHAR(255),
    `time` VARCHAR(32),
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
);

CREATE TABLE btc (
    `guild_id` INT UNSIGNED,
    `user_id` VARCHAR(32),
    `value` DOUBLE(32,8),
    `type` VARCHAR(5),
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE combined_index (`guild_id`, `user_id`)
);

CREATE TABLE events (
    `id` INT UNSIGNED AUTO_INCREMENT,
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT current_timestamp,
    `execute_at` TIMESTAMP(3) NOT NULL,
    `guild_id` INT UNSIGNED,
    `channel_id` VARCHAR(32),
    `initiator_id` VARCHAR(32),
    `action` VARCHAR(64),
    `target_id` VARCHAR(32),
    `data` TEXT,
    `status` VARCHAR(16),
    FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
);

INSERT INTO permissions
    SELECT guilds.guild_id, commands.command_id, commands.permissions_default FROM guilds
        INNER JOIN commands ON commands.command IN (?)

INSERT INTO settings
    SELECT guilds.guild_id, settings_default.setting_id, settings_default.value_default FROM guilds
        INNER JOIN settings_default ON settings_default.setting IN (?)

SELECT table_name FROM information_schema.tables WHERE `table_schema`='${mysql_db}';

SELECT guilds.guild, commands.command, permissions.value FROM permissions
    INNER JOIN guilds ON guilds.guild_id=permissions.guild_id
    INNER JOIN commands ON commands.command_id=permissions.command_id
    /*WHERE guilds.guild="123" AND commands.command="kick"*/;

SELECT guilds.guild, settings_default.setting, settings.value FROM settings
    INNER JOIN guilds ON guilds.guild_id=settings.guild_id
    INNER JOIN settings_default ON settings_default.setting_id=settings.setting_id;

SELECT guilds.guild, stats_cah.user_id, stats_cah.points FROM stats_cah
    INNER JOIN guilds ON guilds.guild_id=stats_cah.guild_id;

SELECT guilds.guild, stats_guild.type, stats_guild.timestamp, stats_guild.value FROM stats_guild
    INNER JOIN guilds ON guilds.guild_id=stats_guild.guild_id
    WHERE guilds.guild=? AND stats_guild.type=?;

SELECT value FROM stats_bot WHERE stat=?;

SELECT guilds.guild, btc.user_id, btc.value, btc.type FROM btc
    INNER JOIN guilds ON guilds.guild_id=btc.guild_id
    WHERE guilds.guild=? AND btc.user_id=?;

SELECT guilds.guild, stats_users.user_id, stats_users.value, stats_users.type FROM stats_users
    INNER JOIN guilds ON guilds.guild_id=stats_users.guild_id
    WHERE guilds.guild=?;

SELECT modlog.id, guilds.guild, modlog.user, modlog.type, modlog.mod, modlog.timestamp, modlog.reason, modlog.time FROM modlog
    INNER JOIN guilds ON guilds.guild_id=modlog.guild_id
    WHERE guilds.guild=? AND modlog.user=?;

SELECT events.id, events.created_at, events.execute_at, guilds.guild, events.channel_id, events.initiator_id, events.action, events.target_id, events.data, events.status FROM events
    INNER JOIN guilds ON guilds.guild_id=events.guild_id;

UPDATE permissions SET `value`=?
    WHERE
        `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?)
        AND
        `command_id`=(SELECT `command_id` FROM commands WHERE `command`=?);

UPDATE settings SET `value`=?
    WHERE
        `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?)
        AND
        `setting_id`=(SELECT `setting_id` FROM settings_default WHERE `setting`=?);

UPDATE stats_cah SET `points`=`points`+?
    WHERE
        `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?)
        AND
        `user_id`=?;

UPDATE btc SET `value`=?
    WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?)
    AND
    `user_id`=?
    AND
    `type`=?;

UPDATE stats_users SET `value`=?
    WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?)
    AND
    `user_id`=?
    AND
    `type`=?;

INSERT INTO events (`execute_at`, `guild_id`, `channel_id`, `initiator_id`, `action`, `target_id`, `data`, `status`)
    SELECT FROM_UNIXTIME(?), guilds.guild_id, ?, ?, ?, ?, ?, ? FROM guilds
        WHERE guilds.guild = ?;

INSERT INTO stats_guild
    SELECT guilds.guild_id, ?, ?, ? FROM guilds
        WHERE guilds.guild = ?;

INSERT INTO stats_cah
    SELECT guilds.guild_id, ?, ? FROM guilds
        WHERE guilds.guild = ?;

INSERT INTO btc
    SELECT guilds.guild_id, ?, ?, ? FROM guilds
        WHERE guilds.guild = ?;

INSERT INTO stats_users
    SELECT guilds.guild_id, ?, ?, ? FROM guilds
        WHERE guilds.guild = ?;

INSERT INTO permissions
    SELECT guilds.guild_id, commands.command_id, commands.permissions_default FROM commands
    INNER JOIN guilds ON guilds.guild=?;

INSERT INTO settings
    SELECT guilds.guild_id, settings_default.setting_id, settings_default.value_default FROM settings_default
    INNER JOIN guilds ON guilds.guild=?;
