const fs = require("fs");
const path = require("path");

const memoriesPath = path.join(
    __dirname,
    "../../data/memories.json"
);

function getMemories() {

    try {

        const data = fs.readFileSync(
            memoriesPath,
            "utf8"
        );

        return JSON.parse(data);

    }
    catch {

        return [];

    }

}

function saveMemories(memoryList) {

    fs.writeFileSync(
        memoriesPath,
        JSON.stringify(memoryList, null, 4)
    );

}

function createMemory(memory) {

    const memoryList = getMemories();

    memoryList.push(memory);

    saveMemories(memoryList);

    return memory;

}

module.exports = {
    getMemories,
    createMemory
};