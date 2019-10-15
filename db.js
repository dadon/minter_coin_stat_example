const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function get(key) {
    let fileContent = null;

    try {
        fileContent = await readFile(key + ".json");
    } catch (e) {}

    let payload = null;
    if (fileContent) {
        payload = JSON.parse(fileContent.toString());
    }
    return payload;
}

async function set(key, value) {
    const payload = JSON.stringify(value);
    await writeFile(key + ".json", payload);
}

module.exports = {
    get,
    set
};
