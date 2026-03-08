import { ExplodeAndCascadeFeature } from "./features/explodeandcascade";
import { FlyingNumberOnRemove } from "./features/flyingNumberOnRemove";
import { PaylinesFeature } from "./features/paylinesfeature";
import { TransformFeature } from "./features/transform";
import { SpinFeature } from "./features/spin";
import type { Feature } from "./features/feature";
import { TributeHarvestFeature } from "./features/tributeharvest";
import { TotalWinFeature } from "./features/totalwin";

type FeatureConstructor = new (...args: any[]) => Feature;
export class FeatureRegistry {
    private static registry: Record<string, FeatureConstructor> = {

        'SPIN_START': SpinFeature,
        'EXPLODE_AND_CASCADE_FEATURE': ExplodeAndCascadeFeature,
        'PAYLINES_FEATURE': PaylinesFeature,
        'TRANSFORM_FEATURE': TransformFeature,
        'FLYING_NUMBER_FEATURE': FlyingNumberOnRemove,
        'TRIBUTE_HARVEST': TributeHarvestFeature,
        'TOTAL_WIN': TotalWinFeature
    };

    public static register(key: string, feature: FeatureConstructor): void {
        this.registry[key] = feature;
    }

    public static get(key: string): FeatureConstructor {
        return this.registry[key]
    }

    public static getAll() {
        return { ...this.registry };
    }
}


