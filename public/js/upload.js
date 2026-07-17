const memoryForm =
    document.getElementById("memoryForm");

const uploadButton =
    document.getElementById("uploadButton");

const uploadStatus =
    document.getElementById("uploadStatus");

const successModal =
    document.getElementById("successModal");

const shareAnotherButton =
    document.getElementById("shareAnotherButton");

memoryForm.addEventListener(
    "submit",
    uploadMemory
);

shareAnotherButton.addEventListener(
    "click",
    closeSuccessModal
);

async function uploadMemory(event) {
    event.preventDefault();

    const guestNameInput =
        document.getElementById("guestName");

    const messageInput =
        document.getElementById("message");

    const mediaInput =
        document.getElementById("media");

    const selectedFile =
        mediaInput.files[0];

    if (!guestNameInput.value.trim()) {
        uploadStatus.textContent =
            "Please enter your name.";

        return;
    }

    if (!selectedFile) {
        uploadStatus.textContent =
            "Please choose a photo or video.";

        return;
    }

    const maximumFileSize =
        50 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
        uploadStatus.textContent =
            "The file must be 50 MB or smaller.";

        return;
    }

    const formData =
        new FormData();

    formData.append(
        "guestName",
        guestNameInput.value.trim()
    );

    formData.append(
        "message",
        messageInput.value.trim()
    );

    formData.append(
        "media",
        selectedFile
    );

    try {
        uploadButton.disabled = true;

        uploadButton.textContent =
            "Uploading...";

        uploadStatus.textContent =
            "Please wait while your memory uploads.";

        const response =
            await fetch(
                "/api/memories",
                {
                    method: "POST",
                    body: formData
                }
            );

        const responseText =
            await response.text();

        let result;

        try {
            result =
                JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                "The server returned an invalid response."
            );
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                "The memory could not be uploaded."
            );
        }

        memoryForm.reset();

        uploadStatus.textContent = "";

        openSuccessModal();

        console.log(
            "Uploaded memory:",
            result.data
        );
    } catch (error) {
        console.error(
            "Upload error:",
            error
        );

        uploadStatus.textContent =
            error.message ||
            "The memory could not be uploaded.";
    } finally {
        uploadButton.disabled = false;

        uploadButton.textContent =
            "Share Memory";
    }
}

function openSuccessModal() {
    successModal.classList.add("show");
}

function closeSuccessModal() {
    successModal.classList.remove("show");

    uploadStatus.textContent = "";
}