import type { Application, Container } from "pixi.js"
import type { Feature } from "./features/feature"

export type UIElement = {
    asset: Asset
    position: Position
    flag?: "SPIN" | "PLUS" | "MINUS" | "MENU" | "INFO"
}

export type GameConfig = {
    gameTitle: string
    gameId: string
    endpoints: {
        spin: string,
        init: string
    }
    width: number
    height: number
    position: Position
    symbolWidthConf: { landscape: number, portrait: number }
    symbolHeightConf: { landscape: number, portrait: number }
    symbolWidth?: number
    symbolHeight?: number
    gapX: number
    gapY: number
    ui?: UIElement[],
    spinTime: number
    reelSpinMode: "CONTINIOUS" | "DROP_IN_DROP_OUT" | "INVISIBLE_FLY_BY"
    motionBlurStrength: number
    spinSpeed: number
    dropSpeed?: number
    isLandscape?: boolean
    spinAcceleration: number
    spinDeacceleration: number
    staggerTime: {
        start: number
        end: number
    }
    windup: {
        pixels: number
        time: number
        ease: string
    }
    bounce: {
        pixels: number
    }

    timeBeforeNextEvent: number
    cols: number
    rows: number

    symbolBg?: Asset
    pathPrefix: string
    features: string[]
    symbols: SymbolDef[]
}

export type GameState = {
    state: "IDLE" | "ACTIVE"
    config: GameConfig
    grid: Grid
    timeline: Timeline | null
    stage: Container
    app: Application
    features: Feature[]
    betAmount: number
    win: number
    sfxEnabled: boolean
}
export type SymbolVisualState =
    | "idle"
    | "land"
    | "win"
    | "remove"
    | "highlight"

export type SymbolDef = {
    id: number
    asset: Asset
    scale: number
    animations?: Partial<Record<SymbolVisualState, string>>
}

export type Timeline = TimelineEvent[];

export interface TimelineEvent {
    index: number
    type: string
    grid: Grid
    win: number
    totalWin: number
    meta: any
}

export type Grid = number[][];

export interface Point {
    x: number
    y: number
}

export function ggetPos(position: Position, config: GameConfig) {
    let y: number = 0;
    let x: number = 0;

    if (position) {
        // Handle Y Axis
        if ("bottom" in position && position.bottom !== undefined) {
            y = config.height - position.bottom;
        } else if ("top" in position && position.top !== undefined) {
            y = position.top;
        }

        // Handle X Axis
        if ("left" in position && position.left !== undefined) {
            x = position.left;
        } else if ("right" in position && position.right !== undefined) {
            x = config.width - position.right;
        }
    }

    return { x, y };
}

export type Asset = {
    src: string
    alias: string
    scale?: number
    zIndex?: number
}


// src/engine/types.ts

// Define the base coordinate system
export type Coordinates =
    (
        | { top: number; bottom?: never }
        | { bottom: number; top?: never }
    ) &
    (
        | { left: number; right?: never }
        | { right: number; left?: never }
    );

// Define Position to be either universal Coordinates OR orientation-specific
export type Position =
    | Coordinates
    | {
        landscape: Coordinates;
        portrait: Coordinates;
    };

export function getPos(position: Position, config: GameConfig) {
    let y: number = 0;
    let x: number = 0;

    if (!position) return { x, y };

    // Determine which coordinates to use based on orientation
    let activeCoords: Coordinates;

    // Check if the position object has orientation keys
    if ('landscape' in position && 'portrait' in position) {
        // Assume portrait if isLandscape is explicitly false, otherwise default to landscape
        activeCoords = config.isLandscape === false ? position.portrait : position.landscape;
    } else {
        // Fallback to universal coordinates
        activeCoords = position as Coordinates;
    }

    // Handle Y Axis
    if ("bottom" in activeCoords && activeCoords.bottom !== undefined) {
        y = config.height - activeCoords.bottom;
    } else if ("top" in activeCoords && activeCoords.top !== undefined) {
        y = activeCoords.top;
    }

    // Handle X Axis
    if ("left" in activeCoords && activeCoords.left !== undefined) {
        x = activeCoords.left;
    } else if ("right" in activeCoords && activeCoords.right !== undefined) {
        x = config.width - activeCoords.right;
    }

    return { x, y };
}