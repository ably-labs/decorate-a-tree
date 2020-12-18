import Ably from 'ably/promises';
import { AblyMessageHandler } from './AblyMessageHandler';
import { StickerCanvas, StickerCollection } from './StickerCanvas';

export class ConnectedCanvas {

    private _ably: any;
    private _canvas: StickerCanvas;

    constructor() {
        this._ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
        this._canvas = new StickerCanvas("decoratedImage");
    }

    public async join(id: string) {

        const channel = this._ably.channels.get(id);
        const messageHandler = new AblyMessageHandler(this._ably, this._canvas);

        const state = await this.retrieveState(id);
        this._canvas.loadItemsFromState(state);

        await channel.subscribe((message) => {
            messageHandler.handle(message);
        });

        this._canvas.onChange(async (changeType, event) => {
            const storageSnapshot = { id, ...this._canvas.snapshot() };

            await fetch("/api/storeState", { method: "POST", body: JSON.stringify(storageSnapshot) });

            channel.publish({ name: changeType, data: event });
        });

        channel.presence.subscribe('enter', async () => { this.updateActiveCount(channel); });
        channel.presence.subscribe('leave', async () => { this.updateActiveCount(channel); });
        channel.presence.enter();
    }

    private async updateActiveCount(channel) {
        const members = await channel.presence.get();
        document.getElementById("memberCount").innerHTML = members.length;
    }

    private async retrieveState(id: string): Promise<StickerCollection> {
        try {
            const stateUrlResponse = await fetch("/api/getStateKey?id=" + id);
            const stateUrl = JSON.parse(await stateUrlResponse.text())?.url;

            const stateDataResponse = await fetch(stateUrl, {
                mode: "cors",
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (stateDataResponse.status !== 200) {
                return null;
            }

            return await stateDataResponse.json() as StickerCollection;
        } catch (ex) {
            console.log(ex);
            return null;
        }
    }
}
