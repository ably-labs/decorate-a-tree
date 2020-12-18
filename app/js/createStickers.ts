import { assets } from "../assets/decorations/manifest";

export function createStickers(targetElement: string) {

    const stickers = document.getElementById(targetElement) as HTMLUListElement;
    stickers.innerHTML = "";

    const filtered = assets.filter(x => x.endsWith(".png"));

    for (let asset of filtered) {
        const assetPath = `assets/decorations/${asset}`;
        const assetParts = assetPath.split("/");
        const fileName = assetParts[assetParts.length - 1];
        const cssAttribute = fileName.split(new RegExp("[\(\)]"))[0];

        const element = document.createElement("li");
        element.setAttribute("data-src", assetPath);
        element.classList.add("decoration");
        element.classList.add(cssAttribute);

        const imgElement = document.createElement("img");
        imgElement.setAttribute("src", assetPath);
        imgElement.classList.add("decoration-img");

        element.appendChild(imgElement);
        stickers.appendChild(element);
    }
}

export function bindDropDownFilter(targetElement: string, stickerElement: string) {

    const stickers = document.getElementById(stickerElement) as HTMLUListElement;
    const dropDown = document.getElementById(targetElement) as HTMLSelectElement;

    dropDown.addEventListener("change", () => {
        stickers.setAttribute("data-filter", dropDown.value);
    });
}