import { Item } from "./StickerCanvas";
import { ResolutionAdjustments } from "./ResolutionAdjustments";

export type DragabbleImageChangedEvent = { draggable: DraggableImage, snapshot: Item };
export type DragabbleImageChangedCallback = (event: DragabbleImageChangedEvent) => void;

export class DraggableImage {

    public id: string;
    public image: HTMLImageElement;

    public x: number;
    public y: number;

    private _onChanged: DragabbleImageChangedCallback = (() => { });

    constructor(imageUrl: string, id = null, x: number = 0, y: number = 0) {
        this.id = id || uuidv4();

        this.image = new Image();
        this.image.src = imageUrl;
        this.image.style.position = "absolute";
        this.image.style.top = "0px";
        this.image.style.left = "0px";
        this.image.classList.add("item");
        this.image.draggable = true;

        this.updatePosition(x, y);
        this.image.addEventListener("dragstart", (ev) => { this.onDragStart(ev); });
    }

    public onDragStart(ev: DragEvent) {
        ev.dataTransfer.setData("id", this.id);
        ev.dataTransfer.setData("offsetX", ev.offsetX + "");
        ev.dataTransfer.setData("offsetY", ev.offsetY + "");
    }

    public onDropped(event: DragEvent, containerElement: HTMLDivElement) {
        const offsetX = parseInt(event.dataTransfer.getData("offsetX"));
        const offsetY = parseInt(event.dataTransfer.getData("offsetY"));

        let left = 0;
        let top = 0;

        if (event.target !== containerElement) {
            // Was dropped on something that wasn't the container target
            // We're just gonna snap those two elements together for now.
            // As it feels the "least broken".

            const ele = event.target as HTMLElement;
            left = parseInt(ele.style["left"].replace("%", ""));
            top = parseInt(ele.style["top"].replace("%", ""));

        } else {
            const x = event["layerX"] - offsetX;
            const y = event["layerY"] - offsetY;

            const targetElement = event.target as HTMLElement;
            const relativeTo = event.target === this.image ? targetElement.parentElement : targetElement;

            const relative = ResolutionAdjustments.toRelativeLocation({ x, y }, {
                width: relativeTo.clientWidth,
                height: relativeTo.clientHeight
            });

            left = relative.xPercent;
            top = relative.yPercent;
        }

        this.updatePosition(left, top);
        this._onChanged({ draggable: this, snapshot: this.toItem() });
    }

    public updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.image.style.top = `${this.y}%`;
        this.image.style.left = `${this.x}%`;
    }

    public onChange(cb: DragabbleImageChangedCallback) {
        this._onChanged = cb;
    }

    public toItem(): Item {
        var temp = document.createElement('a');
        temp.href = this.image.src;
        return { id: this.id, url: temp.pathname, x: this.x, y: this.y };
    }

    public static fromItem(data: Item) { return new DraggableImage(data.url, data.id, data.x, data.y); }
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}