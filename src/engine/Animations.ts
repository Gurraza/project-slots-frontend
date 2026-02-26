import { Assets, AnimatedSprite, Container } from "pixi.js"
import { type Point } from "./types";
import gsap from "gsap"

export async function playAnimation(speed: number, stage: Container, asset: string, position: Point): Promise<void> {
    // Loading via Spritesheet (Preferred)
    let sheet
    if (Assets.cache.has(asset)) {
        sheet = Assets.get(asset)
    }
    else {
        sheet = await Assets.load(asset);
    }

    // Get the animation defined in the JSON "animations" object
    const anim = new AnimatedSprite(sheet.animations['main_loop']);
    anim.animationSpeed = speed
    anim.loop = false
    anim.onComplete = () => {
        anim.destroy()
    }
    anim.anchor.set(.5)
    anim.position.set(position.x, position.y);
    anim.play()
    stage.addChild(anim);

    shake(stage, 15, 0.4)

}

export function shake(whatToMove: Container, intensity: number, duration: number) {
    return new Promise(resolve => {
        const startX = whatToMove.x; // Capture original position
        const startY = whatToMove.y;
        const shakes = 15;           // Number of shakes
        const keyframes = [];

        for (let i = 0; i < shakes; i++) {
            const decay = 1 - (i / shakes); // Shake gets smaller over time
            const x = (Math.random() * intensity * 2 - intensity) * decay;
            const y = (Math.random() * intensity * 2 - intensity) * decay;

            keyframes.push({
                x: startX + x,
                y: startY + y,
                duration: duration / shakes
            });
        }

        // Return to exact original position at the end
        keyframes.push({ x: startX, y: startY, duration: 0.1, ease: "power2.out" });

        // Animate the specific object passed to the function
        gsap.to(whatToMove, {
            keyframes: keyframes,
            onComplete: resolve
        });
    });
}