import type { GameController } from "../GameController";
import type { TimelineEvent } from "../types";
import { Feature } from "./feature";
import * as PIXI from "pixi.js";
import gsap from "gsap";

export class ShowWinFeature extends Feature {
    private text: PIXI.Text | null = null;

    // Animated values
    private displayValue = 0;
    private tweenObj = { value: 0 };

    constructor(game: GameController) {
        super(game, "SHOW_WIN_FEATURE", "*");
    }

    init(): void {
        super.init();

        this.text = this.game.ui.PlaceElement(
            new PIXI.Text({
                text: "",
                style: { fill: 0xffffff, fontSize: 24, align: "center" },

            }),
            {
                position: {
                    landscape: {
                        right: 375,
                        bottom: 48
                    },
                    portrait: {
                        right: 197,
                        bottom: 178
                    }
                },
                zIndex: 5
            }
        );
        this.text.anchor.set(0.5, 0);
    }

    public onSpinStart(): void {
        // Reset everything
        this.displayValue = 0;
        this.tweenObj.value = 0;

        gsap.killTweensOf(this.tweenObj);

        if (this.text) {
            this.text.text = "";
        }
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const target = this.game.gameState.win || 0;

        // Avoid unnecessary tweens
        if (target === this.displayValue) return;

        // Kill previous animation (important for cascades)
        gsap.killTweensOf(this.tweenObj);

        gsap.to(this.tweenObj, {
            value: target,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: () => {
                this.displayValue = this.tweenObj.value;

                if (this.text) {
                    this.text.text =
                        this.displayValue <= 0
                            ? ""
                            : this.displayValue.toFixed(2);
                }
            }
        });
    }

    public onSpinEnd(): void {
        const finalWin = this.game.gameState.win || 0;

        // Kill any running animation
        gsap.killTweensOf(this.tweenObj);

        // Snap to final value
        this.displayValue = finalWin;
        this.tweenObj.value = finalWin;

        if (this.text) {
            this.text.text =
                finalWin <= 0 ? "" : finalWin.toFixed(2);
        }
    }
}