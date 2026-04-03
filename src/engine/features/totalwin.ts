import { Container, Graphics, Text, TextStyle, Ticker } from "pixi.js";
import gsap from "gsap";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import { type TimelineEvent } from "../types";

type WinTier = "SMALL" | "BIG" | "MEGA" | "EPIC";

interface CoinParticle {
    sprite: Graphics;
    vx: number;
    vy: number;
    spinSpeed: number;
    spinAngle: number;
}

export class TotalWinFeature extends Feature {
    private overlay: Container;
    private backdrop: Graphics;
    private winText: Text;
    private coinContainer: Container;

    private resolveSpin: (() => void) | null = null;
    private countUpTween: gsap.core.Tween | null = null;
    private autoCloseTimer: gsap.core.Tween | null = null;

    private targetWin: number = 0;
    private currentTier: WinTier = "SMALL";
    private isCounting: boolean = false;

    private coins: CoinParticle[] = [];
    private coinSpawnTimer: number = 0;

    private readonly TIER_THRESHOLDS = {
        SMALL: 0,
        BIG: 20,
        MEGA: 50,
        EPIC: 100
    };

    private get app() {
        return (this.game as any).app;
    }

    constructor(game: GameController) {
        super(game, "TOTAL_WIN", "GAME_OVER");

        this.overlay = new Container();
        this.overlay.visible = false;
        this.overlay.zIndex = 100;

        const width = this.game.config.width;
        const height = this.game.config.height;

        this.backdrop = new Graphics()
            .rect(0, 0, width, height)
            .fill({ color: 0x000000, alpha: 0.85 });

        this.backdrop.eventMode = 'static';
        this.backdrop.cursor = 'pointer';
        this.backdrop.on('pointerdown', this.handleInteraction.bind(this));

        this.coinContainer = new Container();

        const winStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 120,
            fontWeight: 'bold',
            fill: "white",
            stroke: { color: 0x000000, width: 8 },
            dropShadow: { color: 0x000000, blur: 8, distance: 8 },
            align: 'center'
        });

        this.winText = new Text({ text: "0", style: winStyle });
        this.winText.anchor.set(0.5);
        this.winText.x = width / 2;
        this.winText.y = height / 2;

        this.overlay.addChild(this.backdrop);
        this.overlay.addChild(this.coinContainer);
        this.overlay.addChild(this.winText);

        this.app.stage.addChild(this.overlay);

        this.updateFountain = this.updateFountain.bind(this);
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        this.targetWin = event.totalWin || 0;

        if (this.targetWin <= 0) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.resolveSpin = resolve;
            this.startPresentation();
        });
    }

    private startPresentation(): void {
        this.overlay.visible = true;
        this.overlay.alpha = 1;
        this.winText.text = "0";
        this.winText.scale.set(0.5);
        this.currentTier = "SMALL";
        this.isCounting = true;

        this.app.ticker.add(this.updateFountain);

        const tallyProxy = { value: 0 };
        const duration = this.calculateDuration(this.targetWin);

        gsap.to(this.winText.scale, { x: 1, y: 1, duration: 0.5, ease: "back.out(1.5)" });

        this.countUpTween = gsap.to(tallyProxy, {
            value: this.targetWin,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                const currentVal = Math.floor(tallyProxy.value);
                this.winText.text = currentVal.toString();
                this.checkTier(currentVal);
            },
            onComplete: () => {
                this.finishCountUp();
            }
        });
    }

    private calculateDuration(winAmount: number): number {
        if (winAmount >= this.TIER_THRESHOLDS.EPIC) return 5;
        if (winAmount >= this.TIER_THRESHOLDS.MEGA) return 4;
        if (winAmount >= this.TIER_THRESHOLDS.BIG) return 2.5;
        return 1.5;
    }

    private checkTier(currentValue: number): void {
        let newTier: WinTier = "SMALL";
        if (currentValue >= this.TIER_THRESHOLDS.EPIC) newTier = "EPIC";
        else if (currentValue >= this.TIER_THRESHOLDS.MEGA) newTier = "MEGA";
        else if (currentValue >= this.TIER_THRESHOLDS.BIG) newTier = "BIG";

        if (newTier !== this.currentTier) {
            this.currentTier = newTier;
            this.triggerTierUpgrade();
        }
    }

    private triggerTierUpgrade(): void {
        gsap.fromTo(this.winText.scale,
            { x: 1.3, y: 1.3 },
            { x: 1, y: 1, duration: 0.4, ease: "back.out(2)" }
        );

        // Minor visual burst on upgrade
        this.coinSpawnTimer += 10;
    }

    private handleInteraction(): void {
        // Kill active tweens immediately
        if (this.countUpTween) this.countUpTween.kill();
        if (this.autoCloseTimer) this.autoCloseTimer.kill();
        gsap.killTweensOf(this.winText.scale);

        // Snap text to final value
        this.winText.text = this.targetWin.toString();
        this.isCounting = false;

        // Skip straight to close
        this.closePresentation();
    }

    private finishCountUp(): void {
        this.isCounting = false;
        this.winText.text = this.targetWin.toString();

        gsap.to(this.winText.scale, {
            x: 1.1, y: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut"
        });

        // Auto-close 1 second after hitting the target
        this.autoCloseTimer = gsap.delayedCall(1, () => {
            this.closePresentation();
        });
    }

    private closePresentation(): void {
        this.backdrop.eventMode = 'none';

        gsap.to(this.overlay, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                this.overlay.visible = false;
                this.app.ticker.remove(this.updateFountain);
                this.clearCoins();
                if (this.resolveSpin) {
                    this.resolveSpin();
                    this.resolveSpin = null;
                }
            }
        });
    }

    // --- Particle System Logic ---

    private updateFountain(ticker: Ticker): void {
        this.spawnCoins(ticker.deltaTime);
        this.updateCoins(ticker.deltaTime);
    }

    private spawnCoins(delta: number): void {
        let spawnRate = 0;
        if (this.isCounting) {
            if (this.currentTier === "SMALL") spawnRate = 3;
            else if (this.currentTier === "BIG") spawnRate = 10;
            else if (this.currentTier === "MEGA") spawnRate = 20;
            else if (this.currentTier === "EPIC") spawnRate = 40;
        } else {
            // Rapid fall-off after counting completes
            spawnRate = 0;
        }

        this.coinSpawnTimer += spawnRate * delta;

        while (this.coinSpawnTimer >= 1) {
            this.createCoinParticle();
            this.coinSpawnTimer -= 1;
        }
    }

    private createCoinParticle(): void {
        const colors = [0xFFD700, 0xFFAA00, 0xFFEE88]; // Gold, Orange-Gold, Light-Gold
        const color = colors[Math.floor(Math.random() * colors.length)];
        const radius = 10 + Math.random() * 8;

        const coin = new Graphics()
            .ellipse(0, 0, radius, radius)
            .fill({ color: color });

        coin.x = this.game.config.width / 2;
        coin.y = this.game.config.height + 20;

        // Cone projection physics
        const force = this.getFountainForce();
        const speed = force.base + Math.random() * force.variance;
        const spreadLimit = this.getFountainSpread();
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadLimit; // -90 deg +/- spread

        this.coinContainer.addChild(coin);
        this.coins.push({
            sprite: coin,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            spinSpeed: 0.1 + Math.random() * 0.3,
            spinAngle: Math.random() * Math.PI * 2
        });
    }

    private updateCoins(delta: number): void {
        const gravity = 0.6;
        const heightLimit = this.game.config.height + 100;

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const p = this.coins[i];

            p.vy += gravity * delta;
            p.sprite.x += p.vx * delta;
            p.sprite.y += p.vy * delta;

            // Fake 3D spinning
            p.spinAngle += p.spinSpeed * delta;
            p.sprite.scale.y = Math.cos(p.spinAngle);

            if (p.sprite.y > heightLimit && p.vy > 0) {
                p.sprite.destroy();
                this.coins.splice(i, 1);
            }
        }
    }

    private getFountainSpread(): number {
        // Radians: wider spread for higher tiers
        switch (this.currentTier) {
            case "SMALL": return 0.5;
            case "BIG": return 0.8;
            case "MEGA": return 1.2;
            case "EPIC": return 1.6;
            default: return 0.5;
        }
    }

    private getFountainForce(): { base: number, variance: number } {
        // Higher base velocity for higher tiers
        switch (this.currentTier) {
            case "SMALL": return { base: 18, variance: 6 };
            case "BIG": return { base: 22, variance: 8 };
            case "MEGA": return { base: 28, variance: 10 };
            case "EPIC": return { base: 35, variance: 15 };
            default: return { base: 18, variance: 6 };
        }
    }

    private clearCoins(): void {
        this.coins.forEach(c => c.sprite.destroy());
        this.coins = [];
        this.coinSpawnTimer = 0;
    }
}