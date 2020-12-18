import html2canvas from "html2canvas";

export function enableScreenshot() {
    const screenshotButton = document.getElementById("screenshot") as HTMLButtonElement;
    screenshotButton.addEventListener("click", async () => { exportImage(); });
}

async function exportImage() {
    const element = document.getElementById("decoratedImage") as HTMLElement;
    const children = Array.from(element.children);
    const trashCans = children.filter(x => x.getAttribute("data-role") == "trash").map(ele => ele as HTMLElement);

    trashCans.forEach(tc => tc.style.display = "none"); // (╯°□°）╯︵ ▀▀▀ 

    const canvas = await html2canvas(element) as HTMLCanvasElement;
    const canvasData = canvas.toDataURL("image/png", 1.0);

    trashCans.forEach(tc => tc.style.display = ""); // ( •_•)>⌐■-■ 

    triggerDownload(canvasData);
}

function triggerDownload(base64EncodedImageData: string) {
    const image = base64EncodedImageData.replace("image/png", "image/octet-stream");

    const link = document.createElement('a');
    link.download = "tree.png";
    link.href = image;
    link.click();
}