export type Sharable = { title: string, text: string, url: string };

export function enableSharing() {

    const shareButton = document.getElementById("share") as HTMLButtonElement;

    if (!isNativeShareSupported()) {
        shareButton.innerText = "Copy share link";
    }

    shareButton.addEventListener("click", async () => {
        await share({
            title: 'Decorate my tree!',
            text: 'You are invited to decorate a tree with me.',
            url: `${window.location.href}`
        });
    });
}

function isNativeShareSupported() {
    return navigator.share != null;
}

async function share(shareContent: Sharable) {
    if (!isNativeShareSupported()) {

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareContent.url);
            return;
        }

        console.log("No Sharing available on platform");
        return;
    }

    try {
        await navigator.share(shareContent);
    } catch (ex) {
        console.log("Sharing failed", ex);
    }
}