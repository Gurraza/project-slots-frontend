// src/games/clash_of_reels/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    gameTitle: "Clash Of Reels",
    gameId: "clashofreels",
    endpoints: {
        spin: "/api/play",
        init: ""
    },
    width: 1280,
    height: 720,
    position: {
        left: 1280 / 2,
        top: 720 / 2 - 20
    },
    symbolHeight: 70,
    symbolWidth: 90,
    gapX: 0,
    gapY: 0,
    background: {
        asset: {
            src: "/games/clashofreels/animated_background2_slowmo.mp4",
            alias: "bg"
        }
    },
    ui: {
        spinButton: {
            asset: {
                src: "/games/clashofreels/exp/_0000_SpinBtnInner.png",
                alias: "spinbtn",
                scale: 1
            },
            position: {
                bottom: 60,
                left: 1280 / 2
            }
        }
    },
    reelSpinMode: "CONTINIOUS",
    motionBlurStrength: 8,

    spinSpeed: 25,
    spinAcceleration: .25,
    spinDeacceleration: .25,
    spinTime: 1000,
    staggerTime: {
        start: 100,
        end: 0,
    },
    windup: {
        pixels: 0,
        time: .2,
        ease: "power2.inOut"
    },
    bounce: {
        pixels: 0,
    },
    dropSpeed: 1000,
    timeBeforeNextEvent: 200,
    cols: 7,
    rows: 7,

    symbolBg: {
        src: "/games/clashofreels/Background_Cell.png",
        alias: "cell_bg"
    },
    pathPrefix: "",
    features: [
        "SPIN_START",
        "FLYING_NUMBER_FEATURE",
        "EXPLODE_AND_CASCADE_FEATURE",
        "SPIN_BUTTON_FEATURE",
    ],
    symbols: [
        {
            id: 0,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/wizzard.png",
                alias: "wizzard",
            },
            scale: .8,
        },
        {
            id: 1,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/orch.png",
                alias: "orch",
            },
            scale: .8,
        },
        {
            id: 2,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/dragon.png",
                alias: "dragon",
            },
            scale: .8,
        },
        {
            id: 3,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/Ametist.png",
                alias: "ametist",
            },
            scale: .8,
        },
        {
            id: 4,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/Guld.png",
                alias: "guld",
            },
            scale: .8,
        },
        {
            id: 5,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/Akvamarin.png",
                alias: "akvamarin",
            },
            scale: .8,
        },
        {
            id: 6,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/Safir.png",
                alias: "safir",
            },
            scale: .8,
        },
        {
            id: 63,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/Scatter.png",
                alias: "scatter",
            },
            scale: .8,
        },
        {
            id: 60,
            asset: {
                src: "/games/clashofreels/clash_symbols_v3/Wild.png",
                alias: "wild",
            },
            scale: .8,
        },
    ],
};

export default config;