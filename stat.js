const db = require("./db");

const Periods = {
    Daily: "daily",
    Monthly: "monthly"
};

const PeriodBlocks = {
    [Periods.Daily]: 17280, // blocks per day
    [Periods.Monthly]: 17280 * 30 // blocks per month
};

async function addStat(transactionData, coin, periodName) {
    const key = coin + "_" + periodName;
    const periodBlocks = PeriodBlocks[periodName];

    const newData = [];
    const oldData = await db.get(key);

    if (oldData) {
        for (let el of oldData) {
            if (transactionData.height - el.height <= periodBlocks && el.hash !== transactionData.hash) {
                newData.push(el);
            }
        }
    }

    newData.push(transactionData);

    await db.set(key, newData);
}

async function getStat(coin, periodName) {
    const key = coin + "_" + periodName;
    const data = await db.get(key);

    const uniqueAddresses = [];
    let transactions = 0;
    let volume = 0;

    if (data) {
        transactions = data.length;

        for (let el of data) {
            volume += el.amount;

            for (let address of el.addresses) {
                if (uniqueAddresses.indexOf(address) === -1) {
                    uniqueAddresses.push(address);
                }
            }
        }
    }

    return {
        uniqueAddresses: uniqueAddresses.length,
        transactions,
        volume
    };
}

async function printStat(coin, periodName) {
    const data = await getStat(coin, periodName);
    if (data) {
        for (let prop in data) {
            console.log(`${prop}=${data[prop]}`);
        }
    }
}

async function addToDailyStat(transactionData, coin) {
    await addStat(transactionData, coin, Periods.Daily);
}

async function addToMonthlyStat(transactionData, coin) {
    await addStat(transactionData, coin, Periods.Monthly);
}

module.exports = {
    Periods,
    PeriodBlocks,
    addToDailyStat,
    addToMonthlyStat,
    printStat,
};
