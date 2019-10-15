const { Periods, printStat } = require("./stat");
const { processNewBlocks } = require("./parse_block");

const mode = process.argv[2];

const coin = "TIME";

if (mode === Periods.Daily) {
    printStat(coin, Periods.Daily);
} else if (mode === Periods.Monthly) {
    printStat(coin, Periods.Monthly);
} else {
    processNewBlocks(coin);
}
