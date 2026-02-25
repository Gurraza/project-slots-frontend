// src/games/clash_of_reels/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    title: "Clash Of Reels",
    width: 720,
    height: 1280,
    position: {
        left: 720 / 2,
        top: 1280 / 2
    },
    symbolHeight: 80,
    symbolWidth: 80,
    gapX: 15,
    gapY: 15,
    background: {
        asset: {
            src: "/games/clashofreels/clashofreelsbg.png",
            alias: "bg"
        }
    },
    ui: {
        spinButton: {
            asset: {
                src: "/games/clashofreels/spinbtn.png",
                alias: "spinbtn",
                scale: .7
            },
            position: {
                bottom: 100,
                left: 720 / 2
            }
        }
    },
    symbolsBeforeStop: 0,
    reelSpinMode: "CONTINIOUS",
    motionBlurStrength: 8,

    spinSpeed: 15,
    spinAcceleration: .5,
    spinDeacceleration: .5,
    staggerTime: .1,

    timeBeforeNextEvent: 200,
    cols: 7,
    rows: 7,

    pathPrefix: "",
    features: [
        "CLUSTER_FEATURE"
    ],
    symbols: [
        {
            id: 0,
            asset: {
                src: "/games/clashofreels/barbarian.png",
                alias: "barbarian",
            },
            scale: 1,
        },
        {
            id: 1,
            asset: {
                src: "/games/clashofreels/archer.png",
                alias: "archer",
            },
            scale: 1,
        },
        {
            id: 2,
            asset: {
                src: "/games/clashofreels/goblin.png",
                alias: "goblin",
            },
            scale: 1,
        },
        {
            id: 3,
            asset: {
                src: "/games/clashofreels/hogrider.png",
                alias: "hogrider",
            },
            scale: 1,
        },
    ],
};

export default config;