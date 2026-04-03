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
    symbolWidth: number
    symbolHeight: number
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

export type Position =
    (
        | { top: number; bottom?: never }
        | { bottom: number; top?: never }
    ) &
    (
        | { left: number; right?: never }
        | { right: number; left?: never }
    );


export function getPos(position: Position, config: GameConfig) {
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
export function ggetPos(position: Position, config: GameConfig) {
    let y: number = 0
    let x: number = 0
    if (position) {
        if (position.bottom && position.bottom !== 0) {
            y = config.height - position.bottom
        }
        else if (position.top && position.top !== 0) {
            y = position.top
        }
        if (position.left && position.left !== 0) {
            x = position.left
        }
        else if (position.right && position.right !== 0) {
            x = config.width - position.right
        }
    }
    return { x, y }
}

export type Asset = {
    src: string
    alias: string
    scale?: number
    zIndex?: number
}