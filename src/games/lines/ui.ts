import type { Sprite } from "pixi.js";
import type { UI } from "../../engine/UI";

export function uiInit(UI: UI) {
    UI.PlaceAsset({

        asset: {
            src: "/games/lines/background.png",
            alias: "bg"
        },
        position: { left: 0, top: 0 },
        zIndex: -3,
        fullscreen: true
    })

    UI.PlaceAsset({
        asset: {
            src: "/games/clashofreels/spinbtn.png",
            alias: "spinbtn",
        },
        position: {
            bottom: 100,
            left: 1280 / 2
        },
        anchor: .5,
        action: UI.handleSpinPress,
        zIndex: -1,
        scale: .4
    })

}