const Big = require("big.js");

const db = require("./db");
const { addToMonthlyStat, addToDailyStat, Periods, PeriodBlocks } = require("./stat");
const minter = require("./minter_api");
const { TransactionType } = require("./minter_api");
const { sleep } = require("./utils");

const POW = Big(10).pow(18);

async function processNewBlocks(coin) {
    let lastBlock = await db.get("lastBlock");

    const status = await minter.getStatus();
    let lastBlockHeight = parseInt(status["latest_block_height"]);

    if (!lastBlock) {
        lastBlock = {
            height: lastBlockHeight - PeriodBlocks[Periods.Monthly]
        };
    }

    while (lastBlock.height < lastBlockHeight) {
        const block = await minter.getBlock(lastBlock.height);
        if (!block) {
            await sleep(5000);
            continue;
        }

        console.log(`parse block=${lastBlock.height} tx=${block["transactions"].length}`);

        if (block["transactions"] && block["transactions"].length) {
            await processTransactions(lastBlock.height, block["transactions"], coin);
        }

        await db.set("lastBlock", lastBlock);

        lastBlock.height++;
    }
}

async function processTransactions(height, transactions, coin) {
    for (let transaction of transactions) {
        const data = processTransaction(height, transaction, coin);
        if (data) {
            await addToDailyStat(data, coin);
            await addToMonthlyStat(data, coin);
        }
    }
}

function processTransaction(height, transaction, coin) {
    const hash = transaction.hash;

    const transactionData = {
        hash: hash,
        height: parseInt(height),
        type: null,
        addresses: [],
        amount: 0
    };

    const addAddress = address => {
        if (transactionData.addresses.indexOf(address) === -1) {
            transactionData.addresses.push(address);
        }
    };

    const addAmount = amountStr => {
        const amount = parseFloat(
            Big(amountStr)
                .div(POW)
                .toFixed(4)
        );
        transactionData.amount += amount;
    };

    switch (transaction.type) {
        case TransactionType.Send:
            transactionData.type = "send";

            if (transaction.data.coin === coin) {
                addAddress(transaction.from);
                addAmount(transaction.data.value);
                addAddress(transaction.data.to);
            }
            break;

        case TransactionType.SellCoin:
            transactionData.type = "sell";

            if (transaction.data.coin_to_sell === coin) {
                addAddress(transaction.from);
                addAmount(transaction.data.value_to_sell);
            }
            if (transaction.data.coin_to_buy === coin) {
                addAddress(transaction.from);
                addAmount(transaction.tags["tx.return"]);
            }
            break;

        case TransactionType.SellAllCoin:
            transactionData.type = "sell";

            if (transaction.data.coin_to_sell === coin) {
                addAddress(transaction.from);
                addAmount(transaction.tags["tx.sell_amount"]);
            }
            if (transaction.data.coin_to_buy === coin) {
                addAddress(transaction.from);
                addAmount(transaction.tags["tx.return"]);
            }
            break;

        case TransactionType.BuyCoin:
            transactionData.type = "buy";

            if (transaction.data.coin_to_buy === coin) {
                addAddress(transaction.from);
                addAmount(transaction.data["value_to_buy"]);
            }
            if (transaction.data.coin_to_sell === coin) {
                addAddress(transaction.from);
                addAmount(transaction.tags["tx.return"]);
            }
            break;

        case TransactionType.Multisend:
            transactionData.type = "send";

            for (let el of transaction.data.list) {
                if (el.coin === coin) {
                    addAddress(transaction.from);
                    addAddress(el.to);
                    addAmount(el.value);
                }
            }
            break;
    }

    if (transactionData.amount === 0 || !transactionData.addresses.length) {
        return null;
    }

    return transactionData;
}

module.exports = {
    processNewBlocks
};
