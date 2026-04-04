// src/games/lines/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    gameId: "lines",
    gameTitle: "Lines",
    endpoints: {
        spin: "/api/play",
        init: ""
    },
    width: 1280,
    height: 720,
    position: {
        landscape: {
            left: 1280 / 2,
            top: 720 / 2 + 38
        },
        portrait: {
            left: 720 / 2,
            top: 1280 / 2 + 38
        }
    },
    symbolHeightConf: { landscape: 100, portrait: 100 },
    symbolWidthConf: { landscape: 90, portrait: 90 },
    gapX: 30,
    gapY: 15,
    reelSpinMode: "CONTINIOUS",
    motionBlurStrength: .4,

    spinSpeed: 25,
    spinAcceleration: .8,
    spinDeacceleration: .2,
    staggerTime: {
        start: 100,
        end: 0,
    },
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
    spinTime: 1000,
    pathPrefix: "",
    features: [
        "SPIN_START",
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