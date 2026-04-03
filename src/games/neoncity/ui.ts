import type { UI } from "../../engine/UI";

export function uiInit(UI: UI) {
    UI.PlaceAsset({
        asset: {
            src: "/games/neoncity/background.mp4",
            alias: "bg"
        },
        position: { left: 70, top: 0 },
        zIndex: -3,
        fullscreen: true
    })
    UI.PlaceAsset({
        asset: {
            src: "/games/neoncity/foreground.png",
            alias: "foreground"
        },
        position: { left: 0, top: 0 },
        zIndex: -2,
        fullscreen: true,
    })

    UI.PlaceAsset({
        asset: {
            src: "/games/neoncity/gridbg.png",
            alias: "gridbg"
        },
        position: { left: 0, top: 0 },
        zIndex: -1,
        fullscreen: true,
    })

    UI.PlaceAsset({
        asset: {
            src: "/games/neoncity/ui/spin.png",
            alias: "spinbtn"
        },
        action: UI.handleSpinPress,
        // position: { right: 0, bottom: 100 },
        position: { left: 1280 / 2 + 62, bottom: 100 },
        zIndex: -1,
        scale: .75
    })

}