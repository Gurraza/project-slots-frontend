import type { GameController } from "../GameController";
import type { Point, TimelineEvent } from "../types";
import { Feature } from "./feature";
import * as PIXI from "pixi.js"

export class ShowWinFeature extends Feature {
    private text: PIXI.Text | null = null
    constructor(game: GameController) {
        super(game, "SHOW_WIN_FEATURE", "*")
    }

    init(): void {
        super.init()

        this.text = this.game.ui.PlaceElement(new PIXI.Text({ text: "", style: { fill: 0xffffff, fontSize: 18 } }), {
            position: {
                right: 390,
                bottom: 45
            },
            zIndex: 5,
        });

        this.text.text = "123"

    }
    public onSpinStart(): void {
        this.text!.text = ""
    }

    async onEvent(event: TimelineEvent): Promise<void> {
    }

    public onSpinEnd(): void {
        const win = this.game.gameState.timeline![this.game.gameState.timeline!.length - 1].totalWin.toString()
        this.text!.text = win == "0" ? "" : win

    }
}