const axios = require("axios");

const MINTER_NODE = process.env.MINTER_API_URL || "http://localhost:8841";

async function get(endpoint) {
    const url = `${MINTER_NODE}/${endpoint}`;

    try {
        const apiResponse = await axios.get(url, {
            timeout: 5000
        });

        return apiResponse.data.result;
    } catch (e) {
        console.error("minter request failed", endpoint);

        if (e.response && e.response.data) {
            console.error(e.response.data);
        } else {
            console.error(e);
        }

        return null;
    }
}

async function getStatus() {
    return await get("status");
}

async function getBlock(height) {
    return await get(`block?height=${height}`);
}

async function getAddress(address) {
    return await get(`address?address=${address}`);
}

async function getTransaction(hash) {
    return await get(`transaction?hash=${hash}`);
}

const TransactionType = {
    Send: 1,
    SellCoin: 2,
    SellAllCoin: 3,
    BuyCoin: 4,
    CreateCoin: 5,
    DeclareCandidacy: 6,
    Delegate: 7,
    Unbond: 8,
    RedeemCheck: 9,
    SetCandidateOnline: 10,
    SetCandidateOffline: 11,
    CreateMultisig: 12,
    Multisend: 13,
    EditCandidate: 14
};

module.exports = {
    getStatus,
    getBlock,
    TransactionType
};
