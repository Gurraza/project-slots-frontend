import * as PIXI from "pixi.js"
import type { UI } from "../../engine/UI";

export function uiInit(UI: UI) {
    const isLandscape: boolean = UI.config.isLandscape!

    if (isLandscape) {
        UI.PlaceAsset({
            asset: {
                src: "/games/clashofreels/animated_background2_slowmo.mp4",
                alias: "bg"
            },
            position: { left: 0, top: 0 },
            fullscreen: UI.config.isLandscape,
            zIndex: -2,
            anchor: isLandscape ? 0 : { x: .22, y: 0 },
        })
    }
    else {
        UI.PlaceAsset({
            asset: {
                // src: "/games/clashofreels/background_portrait.png",
                src: "/games/clashofreels/animated_portrait_background.mp4",
                alias: "bg"
            },
            position: { left: 0, top: 0 },
            fullscreen: true,
            zIndex: -2,
            anchor: 0,
        })
    }

    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            landscape: {
                bottom: 60,
                left: UI.config.width / 2
            },
            portrait: {
                bottom: 330,
                left: UI.config.width / 2
            }
        },
        anchor: .5,
    })

    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            left: 235,
            bottom: 45
        },
        anchor: .5,
        scale: .5,
        action: () => { }
    }).then(c => {
        c.alpha = 0
        c.cursor = "not-allowed"
    })
    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            right: 235,
            bottom: 45
        },
        anchor: .5,
        scale: .5,
        action: () => { }
    }).then(c => {
        c.alpha = 0
        c.cursor = "not-allowed"
    })

    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            left: 305,
            bottom: 38
        },
        anchor: .5,
        scale: .4,
        action: () => { }
    }).then(c => {
        c.alpha = 0
        c.cursor = "not-allowed"
    })

    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            left: 420,
            bottom: 38
        },
        anchor: .5,
        scale: .4,
        action: () => { }
    }).then(c => {
        c.alpha = 0
        c.cursor = "not-allowed"
    })

    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            left: 520,
            bottom: 50
        },
        anchor: .5,
        scale: .6,
        action: () => { }
    }).then(c => {
        c.alpha = 0
        c.cursor = "not-allowed"
    })

    UI.PlaceAsset({
        asset: {
            alias: "spinbtn",
            src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
        },
        position: {
            left: 760,
            bottom: 50
        },
        anchor: .5,
        scale: .6,
        action: () => { }
    }).then(c => {
        c.alpha = 0
        c.cursor = "not-allowed"
    })

    if (isLandscape) {

        UI.PlaceAsset({
            asset: {
                alias: "btma",
                src: "/games/clashofreels/bottom.png"
            },
            width: 1280,
            height: 720,
            zIndex: -1,
            position: {
                // top: 0,
                // left: 0,
                landscape: { top: 0, left: 0 },
                portrait: { top: 0, left: -(1280 - 720) / 2 } // Example portrait pos
            }
        })
    }


    UI.PlaceElement(new PIXI.Text({ text: "BET", style: { fill: 0xffffff, fontSize: 18 } }), {
        position: {
            landscape: {
                left: 347,
                bottom: 80

            },
            portrait: {
                left: 347 - (1280 - 720) / 2 + 20000,
                bottom: 80
            }
        },
        zIndex: 5,
    });

    UI.PlaceElement(new PIXI.Text({ text: "WIN", style: { fill: 0xffffff, fontSize: 18 } }), {
        position: {
            landscape: {
                right: 390,
                bottom: 80
            },
            portrait: {
                right: 20000,
                bottom: 80
            }
        },
        zIndex: 5,
    });

    UI.PlaceElement(new PIXI.Text({ text: "60 kr", style: { fill: 0xffffff, fontSize: 24 } }), {
        position: {
            landscape: {
                left: 338,
                bottom: 48
            },
            portrait: {
                left: 175,
                bottom: 190
            }
        },
        zIndex: 5,
    });


}