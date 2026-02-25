import type { GameController } from "../GameController";
import type { Point, TimelineEvent } from "../types";
import { Feature } from "./feature";
import gsap from "gsap"
import { Graphics, Container } from "pixi.js"

type PaylineMeta = {
    lineId: number
    coords: Point[]
    payout: number
    symbol: string
    symbolId: number
    fullPath: number[]
}
const colors = [
    0xFF0000, // Red
    0x00FF00, // Green
    0x0000FF, // Blue
    0xFFFF00, // Yellow
    0xFF00FF, // Magenta
    0x00FFFF, // Cyan
    0xFFA500, // Orange
    0x800080, // Purple
    0xFFC0CB, // Pink
    0xFFD700, // Gold
    0xA52A2A, // Brown
    0x008080, // Teal
    0x800000, // Maroon
    0x000080, // Navy
    0x808000, // Olive
    0xC0C0C0, // Silver
];

export class PaylinesFeature extends Feature {
    private lineLayer: Container

    constructor(game: GameController) {
        super(game, "PAYLINES_FEATURE")
        this.lineLayer = new Container()
        this.game.gameContainer.addChild(this.lineLayer)
    }

    async onEvent(event: TimelineEvent) {
        const meta = event.meta as PaylineMeta[]

        const promises = meta.map((line: PaylineMeta) =>
            this.drawPayline(line.fullPath, line.coords.length, line.lineId)
        );

        await Promise.all(promises);

        if (meta.length > 1) {
            for (const line of meta) {
                await this.drawPayline(line.fullPath, line.coords.length, line.lineId);
            }
        }
    }

    async drawPayline(linePath: number[], len: number, lineId: number): Promise<void> {
        console.log(`len: ${len}`)
        const { symbolWidth, symbolHeight, gapX, gapY } = this.game.config
        const g = new Graphics();
        this.lineLayer.addChild(g);
        const color = colors[lineId % colors.length]

        // 1. Convert logical path to screen coordinates
        const points = linePath.map((rowIdx, colIdx) => ({
            x: colIdx * (symbolWidth + gapX) + symbolWidth / 2,
            y: rowIdx * (symbolHeight + gapY) + symbolHeight / 2
        }));

        const state = { progress: 0 };
        const totalPoints = points.length;

        return new Promise(resolve => {
            gsap.to(state, {
                progress: 1,
                duration: 0.8,
                ease: "power2.out",
                onUpdate: () => {
                    g.clear();

                    // Total length of the line in terms of point-segments
                    const currentDrawHead = (totalPoints - 1) * state.progress;

                    // --- DRAW WINNING SEGMENT (High Opacity) ---
                    g.beginPath();
                    g.moveTo(points[0].x, points[0].y);

                    // Cap the winning line at 'len' or current animation progress
                    const winLimit = Math.min(currentDrawHead, len - 1);

                    for (let i = 1; i <= Math.floor(winLimit); i++) {
                        g.lineTo(points[i].x, points[i].y);
                    }

                    // Interpolate tip of winning line
                    if (winLimit > Math.floor(winLimit)) {
                        const i = Math.floor(winLimit);
                        const fraction = winLimit - i;
                        const p1 = points[i];
                        const p2 = points[i + 1];
                        g.lineTo(
                            p1.x + (p2.x - p1.x) * fraction,
                            p1.y + (p2.y - p1.y) * fraction
                        );
                    }
                    g.stroke({ width: 10, color: color, alpha: 1.0, cap: "round", join: "round" });

                    // --- DRAW REMAINING SEGMENT (Low Opacity) ---
                    // Only draw if animation extends past the winning length
                    if (currentDrawHead > len - 1) {
                        g.beginPath();
                        const startIdx = len - 1;
                        g.moveTo(points[startIdx].x, points[startIdx].y);

                        const lossLimit = currentDrawHead;

                        for (let i = startIdx + 1; i <= Math.floor(lossLimit); i++) {
                            g.lineTo(points[i].x, points[i].y);
                        }

                        if (lossLimit > Math.floor(lossLimit)) {
                            const i = Math.floor(lossLimit);
                            const fraction = lossLimit - i;
                            const p1 = points[i];
                            const p2 = points[i + 1];
                            g.lineTo(
                                p1.x + (p2.x - p1.x) * fraction,
                                p1.y + (p2.y - p1.y) * fraction
                            );
                        }
                        g.stroke({ width: 10, color: color, alpha: 0.3, cap: "round", join: "round" });
                    }
                },
                onComplete: () => {
                    // Hold for 400ms then clear
                    // await new Promise(r => setTimeout(r, 400));
                    // g.destroy(); // Cleanup the temporary graphics object
                    // resolve();

                    gsap.delayedCall(0.4, () => {
                        g.destroy();
                        resolve();
                    });
                }
            });
        });
    }
}