import { ConnectedCanvas } from './js/ConnectedCanvas';
import { bindDropDownFilter, createStickers } from './js/createStickers';
import { generateName } from './js/GenerateName';
import { enableScreenshot } from './js/Screenshot';
import { enableSharing } from './js/Sharing';

const treeNameInput = document.getElementById("treeName") as HTMLInputElement;
const joinButton = document.getElementById("join") as HTMLButtonElement;
const activeTree = document.getElementById("activeTree") as HTMLElement;

(async function () {
    const urlParams = new URLSearchParams(location.search);
    const treeName = urlParams.get("treeName");

    if (!treeName) {
        treeNameInput.value = generateName(3, "-").toLowerCase();
        joinButton.classList.remove("hidden");
        return;
    }

    createStickers("stickers");
    bindDropDownFilter("assetFilter", "stickers");

    const connectedCanvas = new ConnectedCanvas();
    await connectedCanvas.join(`festive2020-${treeName}`);

    enableSharing();
    enableScreenshot();

    activeTree.classList.remove("hidden");
})();