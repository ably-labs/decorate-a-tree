import { Item } from "./StickerCanvas";
import { ResolutionAdjustments } from "./ResolutionAdjustments";
import { DragabbleImageChangedCallback, DraggableImage } from "./DraggableImage";

export type DraggableImageCollectionChangedEvent = { modification: DraggableImage[], snapshot: Item[] };
export type DraggableImageCollectionChangedCallback = (event: DraggableImageCollectionChangedEvent) => void;

export class DraggableImageCollection {

    private _root: HTMLElement;
    private _container: HTMLDivElement;
    private _trash: HTMLDivElement;
    private _elements: DraggableImage[];

    private _onChanged: DraggableImageCollectionChangedCallback = (() => { });
    private _onItemMovedDefault: DragabbleImageChangedCallback = (() => { });

    constructor(root: string | HTMLElement) {
        this._root = typeof root === "string" ? document.getElementById(root) : root;
        this._elements = [];

        this._container = document.createElement("div") as HTMLDivElement;
        this._container.classList.add("contents");
        this._container.addEventListener("drop", (event) => { this.itemDroppedHandler(event); });
        this._container.addEventListener("dragover", (event) => { event.preventDefault(); });

        this._trash = document.createElement("div") as HTMLDivElement;
        this._trash.classList.add("trash");
        this._trash.setAttribute("data-role", "trash");
        this._trash.addEventListener("drop", (event) => { this.itemDroppedHandler(event); });
        this._trash.addEventListener("dragover", (event) => { event.preventDefault(); });
        this._trash.addEventListener("dblclick", () => { this.clear(); })

        this._root.appendChild(this._container);
        this._root.appendChild(this._trash);
    }

    public push(draggable: DraggableImage | DraggableImage[]) {
        const items = Array.isArray(draggable) ? draggable : [draggable];
        this._elements.push(...items);
        this.render();

        this._onChanged({ modification: items, snapshot: this.toItems() });
    }

    public remove(draggable: DraggableImage) {
        this._elements = this._elements.filter(x => x.id !== draggable.id);
        this.render();

        this._onChanged({ modification: [draggable], snapshot: this.toItems() });
    }

    public clear() {
        this._container.innerHTML = "";
        this._elements = [];
        this.render();

        this._onChanged({ modification: [], snapshot: this.toItems() });
    }

    public find(id: string) {
        return this._elements.filter(x => x.id === id)[0];
    }

    public render() {
        this._container.innerHTML = "";
        this._elements.forEach(d => this._container.appendChild(d.image));
    }

    public toItems(): Item[] { return this._elements.map(i => i.toItem()); }

    public onChange(cb: DraggableImageCollectionChangedCallback) {
        this._onChanged = cb;
    }

    public onItemMoved(cb: DragabbleImageChangedCallback) {
        this._onItemMovedDefault = cb;
    }

    private itemDroppedHandler(event: DragEvent) {
        event.preventDefault();

        const id = event.dataTransfer.getData("id");
        const elementExists = this._elements.filter(x => x.id === id).length > 0;

        if (elementExists) {

            const targetElement = event.target as HTMLElement;
            const targetRole = targetElement.getAttribute("data-role") === "trash" ? "trash" : "drop";

            if (targetRole === "trash") {
                this._elements.filter(x => x.id === id).forEach(d => this.remove(d));
                return;
            }

            this._elements.filter(x => x.id === id).forEach(d => d.onDropped(event, this._container));
            return;
        }

        this.addNewItem(event);
    }

    private addNewItem(event: DragEvent) {

        const src = event.dataTransfer.getData("src");
        const offsetX = parseInt(event.dataTransfer.getData("offsetX"));
        const offsetY = parseInt(event.dataTransfer.getData("offsetY"));

        const x = event["layerX"] - offsetX;
        const y = event["layerY"] - offsetY;

        const relative = ResolutionAdjustments.toRelativeLocation({ x, y }, {
            width: event.target["clientWidth"],
            height: event.target["clientHeight"]
        });

        const draggable = new DraggableImage(src, null, relative.xPercent, relative.yPercent);
        draggable.onChange(this._onItemMovedDefault);
        this.push(draggable);
    }
}
