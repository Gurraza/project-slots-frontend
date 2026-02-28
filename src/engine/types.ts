import type { Application, Container } from "pixi.js"
import type { Feature } from "./features/feature"

export type GameConfig = Readonly<{
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
    background: {
        asset: Asset
    }
    ui: {
        spinButton: {
            position: Position,
            asset: Asset
        },
    }
    symbolsBeforeStop: number
    reelSpinMode: "CONTINIOUS" | "DROP_IN_DROP_OUT" | "INVISIBLE_FLY_BY"
    motionBlurStrength: number
    spinSpeed: number
    dropSpeed?: number
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

    pathPrefix: string
    features: string[]
    symbols: SymbolDef[]
}>

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
    let y: number = 0
    let x: number = 0
    if (position) {
        if (position.bottom) {
            y = config.height - position.bottom
        }
        else if (position.top) {
            y = position.top
        }
        if (position.left) {
            x = position.left
        }
        else if (position.right) {
            x = config.width - position.right
        }
    }
    return { x, y }
}

export type Asset = {
    src: string
    alias: string
    scale?: number
}