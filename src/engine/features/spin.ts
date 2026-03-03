import type { GameController } from "../GameController";
import type { Point, TimelineEvent } from "../types";
import { Feature } from "./feature";

interface AnticipationMeta {
    columns: number[],
    id: number,
    highlightPositions: Point[],
    startReelIndex: number
}

export class SpinFeature extends Feature {
    constructor(game: GameController) {
        super(game, "SPIN_START")

    }

    async onEvent(event: TimelineEvent): Promise<void> {
        // 1. Start all reels immediately. 
        this.game.reels.forEach(reel => reel.spin()); // Adjust to reel.startSpin() if renamed

        // 2. Safely check for an anticipation event in the current timeline
        const anticipationEvent = this.game.getTimelineEvent(event.index - 1)

        // 3. Branch logic
        if (anticipationEvent && anticipationEvent.type == "ANTICIPATION") {
            const meta = anticipationEvent.meta as AnticipationMeta;
            await this.executeAnticipationStop(event.grid, meta);
        } else {
            await this.executeStandardStop(event.grid);
        }
    }

    private async executeStandardStop(grid: number[][]): Promise<void> {
        const promises: Promise<void>[] = [];

        this.game.reels.forEach((reel, i) => {
            const stopPromise = new Promise<void>((resolve) => {
                setTimeout(() => {
                    reel.commandStop(grid[i]).then(resolve);
                }, this.game.config.spinTime + (i * this.game.config.staggerTime.start));
            });
            promises.push(stopPromise);
        });

        await Promise.all(promises);
    }
    // In SpinFeature.ts

    private async executeAnticipationStop(grid: number[][], meta: AnticipationMeta): Promise<void> {
        const { startReelIndex, highlightPositions } = meta;
        const promises: Promise<void>[] = [];

        // 1. Stop reels before the anticipation trigger normally
        for (let i = 0; i < startReelIndex; i++) {
            const stopPromise = new Promise<void>((resolve) => {
                setTimeout(() => {
                    this.game.reels[i].commandStop(grid[i]).then(() => {
                        // Dim the reel as soon as it lands
                        this.game.reels[i].dimReel();
                        resolve();
                    });
                }, this.game.config.spinTime + (i * this.game.config.staggerTime.start));
            });
            promises.push(stopPromise);
        }

        // Wait for the base reels to land
        await Promise.all(promises);

        // 2. Highlight the specific trigger symbols on the landed reels
        highlightPositions.forEach(pos => {
            // Pos.x is column (reel index), pos.y is row
            if (pos.x < startReelIndex) {
                this.game.reels[pos.x].highlightSymbol(pos.y);
            }
        });

        // 3. Slow down the reels that are currently spinning in anticipation
        for (let i = startReelIndex; i < this.game.reels.length; i++) {
            this.game.reels[i].slowDownForAnticipation();
            this.game.reels[i].showAnticipationBorder(); // <--- Add this
        }

        // 4. Stop the anticipated reels with significant delay
        const anticipationPromises: Promise<void>[] = [];
        const baseAnticipationDelay = this.game.config.spinTime;

        for (let i = startReelIndex; i < this.game.reels.length; i++) {
            const stopPromise = new Promise<void>((resolve) => {
                setTimeout(() => {
                    // Restore speed right before stopping so the landing animation looks correct
                    // this.game.reels[i].restoreSpeed();

                    this.game.reels[i].commandStop(grid[i]).then(() => {
                        // Ensure it also dims if it's not the final reel
                        // (Optional depending on your design preference)
                        this.game.reels[i].dimReel();
                        this.game.reels[i].hideBorder();
                        highlightPositions.forEach(pos => {
                            // Pos.x is column (reel index), pos.y is row
                            if (pos.x <= i) {
                                this.game.reels[pos.x].highlightSymbol(pos.y);
                            }
                        });
                        resolve();
                    });
                }, baseAnticipationDelay + ((i - startReelIndex) * 1500)); // Increased stagger for tension
            });
            anticipationPromises.push(stopPromise);
        }

        await Promise.all(anticipationPromises);

        // 5. Cleanup: Remove the dimming from all reels before the next state
        this.game.reels.forEach(reel => reel.removeDim());
        this.game.reels.forEach(reel => reel.restoreSpeed());
    }


}