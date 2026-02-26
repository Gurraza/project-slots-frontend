// src/games/clash_of_reels/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    title: "Clash Of Reels",
    endpoints: {
        spin: "/play/clashofreels",
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
            src: "/games/clashofreels/animated_background2.mp4",
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
    symbolsBeforeStop: 3,
    reelSpinMode: "CONTINIOUS",
    motionBlurStrength: 8,

    spinSpeed: 25,
    spinAcceleration: .25,
    spinDeacceleration: .25,
    staggerTime: {
        start: 0,
        end: 1,
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

    pathPrefix: "",
    features: [
        "EXPLODE_AND_CASCADE_FEATURE",
        "SPIN_BUTTON_FEATURE"
    ],
    symbols: [
        {
            id: 0,
            asset: {
                src: "/games/clashofreels/exp/_0008_Fire_Barbarian.png",
                alias: "barbarian",
            },
            scale: 1.1,
        },
        {
            id: 1,
            asset: {
                src: "/games/clashofreels/exp/_0017_Archer.png",
                alias: "archer",
            },
            scale: 1,
        },
        {
            id: 2,
            asset: {
                src: "/games/clashofreels/exp/_0013_Goblin.png",
                alias: "goblin",
            },
            scale: 1,
        },
        {
            id: 3,
            asset: {
                src: "/games/clashofreels/exp/_0016_Minion.png",
                alias: "minion",
            },
            scale: 1,
        },
        {
            id: 4,
            asset: {
                src: "/games/clashofreels/exp/_0007_Pekka.png",
                alias: "pekka",
            },
            scale: 1,
        },
        {
            id: 5,
            asset: {
                src: "/games/clashofreels/exp/_0011_Gem.png",
                alias: "gem",
            },
            scale: 1,
        },
        {
            id: 6,
            asset: {
                src: "/games/clashofreels/exp/_0014_Elixir.png",
                alias: "elixir",
            },
            scale: 1,
        },
        {
            id: 7,
            asset: {
                src: "/games/clashofreels/exp/_0015_Gold.png",
                alias: "gold",
            },
            scale: 1,
        },
        {
            id: 8,
            asset: {
                src: "/games/clashofreels/exp/_0010_Dark_Elixir.png",
                alias: "darkelixir",
            },
            scale: 1,
        },
        {
            id: 9,
            asset: {
                src: "/games/clashofreels/exp/_0005_BarbarianKing.png",
                alias: "barbarianking",
            },
            scale: 1.3,
        },
    ],
};

export default config;