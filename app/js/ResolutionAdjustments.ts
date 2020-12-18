export type Coord = { x: number, y: number };
export type Dimension = { width: number, height: number };
export type RelativeLocation = { xPercent: number, yPercent: number };

export class ResolutionAdjustments {

    public static toRelativeLocation(location: Coord, containerSize: Dimension): RelativeLocation {
        const totalWidth = containerSize.width === 0 ? 1 : containerSize.width;
        const totalHeight = containerSize.height === 0 ? 1 : containerSize.height;

        const xPercent = (location.x / totalWidth) * 100;
        const yPercent = (location.y / totalHeight) * 100;
        return { xPercent, yPercent };
    }
}