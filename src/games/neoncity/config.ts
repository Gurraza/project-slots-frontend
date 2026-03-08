// src/games/clash_of_reels/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    gameTitle: "Neon City",
    gameId: "neoncity",
    cols: 6,
    rows: 5,
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
    symbolHeight: 110,
    symbolWidth: 110,
    gapX: 0,
    gapY: 0,
    background: {
        asset: {
            src: "/games/neoncity/background.png",
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
    reelSpinMode: "DROP_IN_DROP_OUT",

    spinSpeed: 25,
    spinAcceleration: .25,
    spinDeacceleration: .25,
    spinTime: 500,
    motionBlurStrength: .4,
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

    symbolBg: {
        src: "/games/clashofreels/Background_Cell.png",
        alias: "cell_bg"
    },
    pathPrefix: "",
    features: [
        "SPIN_START",
        "FLYING_NUMBER_FEATURE",
        "EXPLODE_AND_CASCADE_FEATURE",
        "TRANSFORM_FEATURE",
        "TRIBUTE_HARVEST",
        // "TOTAL_WIN",
    ],
    symbols: [
        {
            id: 0,
            asset: {
                src: "/games/neoncity/cards.png",
                alias: "cards",
            },
            scale: 1,
        },
        {
            id: 1,
            asset: {
                src: "/games/neoncity/cash.png",
                alias: "cash",
            },
            scale: 1,
        },
        {
            id: 2,
            asset: {
                src: "/games/neoncity/cherry.png",
                alias: "cherry",
            },
            scale: 1,
        },
        {
            id: 3,
            asset: {
                src: "/games/neoncity/circles.png",
                alias: "circles",
            },
            scale: 1,
        },
        {
            id: 4,
            asset: {
                src: "/games/neoncity/clover.png",
                alias: "clover",
            },
            scale: 1,
        },
        {
            id: 5,
            asset: {
                src: "/games/neoncity/crown.png",
                alias: "crown",
            },
            scale: 1,
        },
        {
            id: 6,
            asset: {
                src: "/games/neoncity/diamond.png",
                alias: "diamond",
            },
            scale: 1,
        },
        {
            id: 7,
            asset: {
                src: "/games/neoncity/grape.png",
                alias: "grape",
            },
            scale: 1,
        },
        {
            id: 63,
            asset: {
                src: "/games/neoncity/trophy.png",
                alias: "trophy",
            },
            scale: 1,
        },
        {
            id: 60,
            asset: {
                src: "/games/neoncity/horseshoe.png",
                alias: "horseshoe",
            },
            scale: 1,
        },
        {
            id: 61,
            asset: {
                src: "/games/neoncity/orange.png",
                alias: "orange",
            },
            scale: 1,
        },
    ],
};

export default config;