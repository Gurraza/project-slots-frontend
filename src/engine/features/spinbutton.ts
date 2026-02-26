import type { Container, Sprite } from "pixi.js";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import gsap from "gsap"

export class SpinButtonFeature extends Feature {
    private sprite: Container | null = null
    constructor(game: GameController) {
        super(game, "SPIN_BUTTON_FEATURE")
    }

    init(): void {
        super.init()

        this.game.place("/games/clashofreels/exp/_0001_SpinBtnOuter.png", { bottom: 57, left: this.game.config.width / 2 + 4 }).then((sprite: Container) => {
            sprite.zIndex = 100
            this.sprite = sprite
        })
    }

    public onSpinStart() {
        if (!this.sprite) return
        gsap.to(this.sprite, {
            rotation: Math.PI * 2,
            ease: "linear",
            duration: 2,
        })
    }

    public onSpinEnd() {

    }
}