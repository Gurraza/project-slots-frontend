// src/games/clash_of_reels/config.ts
import { type GameConfig } from '../../engine/types.ts';

const config: GameConfig = {
    gameTitle: "Neon City",
    gameId: "neoncity",
    cols: 8,
    rows: 8,
    endpoints: {
        spin: "/api/play",
        init: ""
    },
    width: 1280,
    height: 720,
    position: {
        left: 1280 / 2 + 75,
        top: 720 / 2 - 33
    },
    symbolHeight: 65,
    symbolWidth: 65,
    gapX: 12,
    gapY: 2,
    reelSpinMode: "DROP_IN_DROP_OUT",

    spinSpeed: 15,
    spinAcceleration: .25,
    spinDeacceleration: .25,
    spinTime: 300,
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
    pathPrefix: "",
    features: [
        "SPIN_START",
        "FLYING_NUMBER_FEATURE",
        "EXPLODE_AND_CASCADE_FEATURE",
        "TRANSFORM_FEATURE",
        "TRIBUTE_HARVEST",
        // "TOTAL_WIN",
        "WHEEL",
    ],
    symbols: [
        {
            id: 1,
            asset: {
                src: "/games/neoncity/cards.png",
                alias: "cards",
            },
            scale: 1,
        },
        {
            id: 2,
            asset: {
                src: "/games/neoncity/cash.png",
                alias: "cash",
            },
            scale: 1,
        },
        {
            id: 3,
            asset: {
                src: "/games/neoncity/cherry.png",
                alias: "cherry",
            },
            scale: 1,
        },
        {
            id: 4,
            asset: {
                src: "/games/neoncity/circles.png",
                alias: "circles",
            },
            scale: 1,
        },
        {
            id: 5,
            asset: {
                src: "/games/neoncity/clover.png",
                alias: "clover",
            },
            scale: 1,
        },
        {
            id: 6,
            asset: {
                src: "/games/neoncity/crown.png",
                alias: "crown",
            },
            scale: 1,
        },
        {
            id: 7,
            asset: {
                src: "/games/neoncity/diamond.png",
                alias: "diamond",
            },
            scale: 1,
        },
        {
            id: 8,
            asset: {
                src: "/games/neoncity/grape.png",
                alias: "grape",
            },
            scale: 1,
        },
        {
            id: 9,
            asset: {
                src: "/games/neoncity/trophy.png",
                alias: "trophy",
            },
            scale: 1,
        },
        {
            id: 10,
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