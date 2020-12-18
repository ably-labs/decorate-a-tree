import { DragabbleImageChangedCallback, DragabbleImageChangedEvent, DraggableImage } from "./DraggableImage";
import { DraggableImageCollection, DraggableImageCollectionChangedEvent } from "./DraggableImageCollection";

export type Item = { id: string; url: string; x: number; y: number; }
export type StickerCollection = { backgroundUrl: string; items: Item[] };

export type ContentsChangedCallbackEvent = { event: DraggableImageCollectionChangedEvent | DragabbleImageChangedEvent, background: string };
export type ContentsChangedCallback = (changeType: string, source: ContentsChangedCallbackEvent) => void;

export class StickerCanvas {

    private _root: HTMLElement;
    private _backgroundImage: HTMLImageElement;
    private _contents: DraggableImageCollection;

    private _onChanged: ContentsChangedCallback = (() => { });
    private _draggableItemMovedCallback: DragabbleImageChangedCallback = (() => { });

    public get backgroundImage() {
        var temp = document.createElement('a');
        temp.href = this._backgroundImage.src;
        return temp.pathname;
    }

    constructor(root: string | HTMLElement) {
        this._root = typeof root === "string" ? document.getElementById(root) : root;
        this._draggableItemMovedCallback = ((event) => { this.onItemMovedHandler(event); });

        this.loadItemsFromState({ backgroundUrl: "./assets/tree.png", items: [] });
        this.addEventHandlersToStickers();
        this.addEventHandlersToBackgroundChangingButtons();
    }

    public loadItemsFromState(state: StickerCollection) {
        if (state == null) {
            return;
        }

        this._root.innerHTML = "";

        this._backgroundImage = document.createElement("img") as HTMLImageElement;
        this._backgroundImage.src = state.backgroundUrl;
        this._backgroundImage.classList.add("background");
        this._root.appendChild(this._backgroundImage);

        const draggables = state.items.map(item => DraggableImage.fromItem(item));
        draggables.forEach(d => d.onChange(this._draggableItemMovedCallback));

        this._contents = new DraggableImageCollection(this._root);
        this._contents.onItemMoved(this._draggableItemMovedCallback);
        this._contents.push(draggables);

        this._contents.onChange(event => { this.onCollectionChangedHandler(event); });
    }

    public updatePosition(delta: DragabbleImageChangedEvent) {
        const item = this._contents.find(delta.draggable.id);
        item?.updatePosition(delta.draggable.x, delta.draggable.y);
    }

    public updateBackground(url: string, notify: boolean = false) {
        this._backgroundImage.src = url;

        if (notify) {
            this._onChanged("backgroundUpdated", { event: null, background: this.backgroundImage });
        }
    }

    public snapshot(): StickerCollection {
        return { backgroundUrl: this.backgroundImage, items: this._contents.toItems() };
    }

    public onChange(cb: ContentsChangedCallback) {
        this._onChanged = cb;
    }

    private onItemMovedHandler(event: DragabbleImageChangedEvent) {
        this._onChanged("itemMoved", { event: event, background: this.backgroundImage });
    }

    private onCollectionChangedHandler(event: DraggableImageCollectionChangedEvent) {
        this._onChanged("collectionChanged", { event: event, background: this.backgroundImage });
    }

    private addEventHandlersToBackgroundChangingButtons() {
        const radios = Array.from(document.querySelectorAll(".lights-radio"));

        for (let element of radios) {

            const radio = element as HTMLButtonElement;

            radio.addEventListener("change", (event) => {
                const bgSrc = radio.getAttribute("data-src");
                this.updateBackground(bgSrc, true);
            });
        }
    }

    private addEventHandlersToStickers() {
        const stickers = document.getElementById("stickers");
        const items = Array.from(stickers.children);

        for (let sticker of items) {

            const stickerImage = sticker as HTMLElement;
            stickerImage.draggable = true;

            const src = sticker["src"] ?? sticker.getAttribute("data-src");

            stickerImage.addEventListener("dragstart", (ev) => {
                ev.dataTransfer.setData("src", src);
                ev.dataTransfer.setData("offsetX", ev.offsetX + "");
                ev.dataTransfer.setData("offsetY", ev.offsetY + "");
            });
        }
    }
}