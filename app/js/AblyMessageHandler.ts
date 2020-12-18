import { Types } from "ably/promises";
import { StickerCanvas } from "./StickerCanvas";

export class AblyMessageHandler {

    private _ably: any;
    private _canvas: StickerCanvas;

    constructor(ably: any, canvas: StickerCanvas) {
        this._ably = ably;
        this._canvas = canvas;
    }

    public handle(message: Types.Message): void {
        if (this._ably.connection.id === message.connectionId) {
            return;
        }

        if (message.name === "itemMoved") {
            this._canvas.updatePosition(message.data.event);
        }

        if (message.name === "backgroundUpdated") {
            this._canvas.updateBackground(message.data.background);
        }

        if (message.name === "collectionChanged") {
            this._canvas.loadItemsFromState({
                backgroundUrl: message.data.background,
                items: message.data.event.snapshot
            });
        }
    }
}