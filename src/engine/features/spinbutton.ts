import type { Container } from "pixi.js";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import gsap from "gsap"

export class SpinButtonFeature extends Feature {
    private sprite: Container | null = null
    private spinTween: gsap.core.Tween | null = null;
    private isSpinning: boolean = false;
    constructor(game: GameController) {
        super(game, "SPIN_BUTTON_FEATURE")
    }

    init(): void {
        super.init()

        this.game.place("/games/clashofreels/exp/_0001_SpinBtnOuter.png", { bottom: 60, left: this.game.config.width / 2 + 0 }).then((sprite: Container) => {
            sprite.zIndex = 100
            this.sprite = sprite
        })
    }


    public onSpinStart() {
        if (!this.sprite || this.isSpinning) return;

        this.isSpinning = true;

        this.spinTween = gsap.to(this.sprite, {
            rotation: "+=" + Math.PI * 2, // relative rotation
            duration: 5,
            ease: "none",
            repeat: -1, // infinite
        });
    }

    public onSpinEnd() {
        if (!this.sprite || !this.isSpinning) return;

        this.isSpinning = false;

        if (this.spinTween) {
            this.spinTween.kill();
            this.spinTween = null;
        }
    }
}