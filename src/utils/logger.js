const Console = console;
const date = {
    toString: () => {
        return new Date().toString().split(" GMT")[0];
    }
};
const Colors = {
    BLACK: "\x1b[30m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m",
};

function error (err) {
    output(Colors.RED, err);
}

function info (inf) {
    output(Colors.BLUE, inf);
}

function log (stream) {
    output(Colors.WHITE, stream);
}

function output(color, text) {
    Console.log(`${color}${date} | ${text}\x1b[0m`);
}

module.exports = {
    error,
    info,
    log,
};
