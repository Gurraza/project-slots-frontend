// src/games/clash_of_reels/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    title: "Clash Of Reels",
    endpoints: {
        spin: "/play/lines",
        init: ""
    },
    width: 1280,
    height: 720,
    position: {
        left: 1280 / 2,
        top: 720 / 2 + 25
    },
    symbolHeight: 90,
    symbolWidth: 90,
    gapX: 30,
    gapY: 15,
    background: {
        asset: {
            src: "/games/lines/background.png",
            alias: "bg"
        }
    },
    ui: {
        spinButton: {
            asset: {
                src: "/games/clashofreels/spinbtn.png",
                alias: "spinbtn",
                scale: .4
            },
            position: {
                bottom: 100,
                left: 1280 / 2
            }
        }
    },
    symbolsBeforeStop: 0,
    reelSpinMode: "CONTINIOUS",
    motionBlurStrength: 8,

    spinSpeed: 15,
    spinAcceleration: .5,
    spinDeacceleration: .2,
    staggerTime: .1,
    windup: {
        pixels: 0,
        time: 0,
        ease: "power1.in"
    },
    bounce: {
        pixels: 0,
    },

    timeBeforeNextEvent: 200,
    cols: 5,
    rows: 3,

    pathPrefix: "",
    features: [
        "TRANSFORM_FEATURE",
        "PAYLINES_FEATURE",
    ],
    symbols: [
        {
            id: 1,
            asset: {
                src: "/games/lines/cherry.png",
                alias: "cherry",
            },
            scale: 1,
        },
        {
            id: 2,
            asset: {
                src: "/games/lines/banana.png",
                alias: "banana",
            },
            scale: 1,
        },
        {
            id: 3,
            asset: {
                src: "/games/lines/orange.png",
                alias: "orange",
            },
            scale: 1,
        },
        {
            id: 4,
            asset: {
                src: "/games/lines/plum.png",
                alias: "plum",
            },
            scale: 1,
        },
        {
            id: 5,
            asset: {
                src: "/games/lines/bar.png",
                alias: "bar",
            },
            scale: 1,
        },
        {
            id: 6,
            asset: {
                src: "/games/lines/watermelon.png",
                alias: "watermelon",
            },
            scale: 1,
        },
        {
            id: 7,
            asset: {
                src: "/games/lines/seven.png",
                alias: "seven",
            },
            scale: 1,
        },
    ],
};

export default config;