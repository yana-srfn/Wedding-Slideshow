const {
    readMemoriesFromDrive,
    saveMemoriesToDrive
} = require("../services/googleDriveService");

/*
    This queue prevents two uploads from updating
    memories.json at exactly the same time.
*/
let saveQueue = Promise.resolve();

async function getMemories() {
    try {
        return await readMemoriesFromDrive();
    } catch (error) {
        console.error(
            "Read Drive memories error:",
            error.response?.data ||
            error.message ||
            error
        );

        throw error;
    }
}

async function createMemory(memory) {
    const saveOperation = saveQueue.then(
        async function () {
            const memoryList =
                await getMemories();

            memoryList.push(memory);

            await saveMemoriesToDrive(
                memoryList
            );

            return memory;
        }
    );

    /*
        Keep the queue working even if one save fails.
    */
    saveQueue = saveOperation.catch(
        function () {
            return null;
        }
    );

    return saveOperation;
}

module.exports = {
    getMemories,
    createMemory
};