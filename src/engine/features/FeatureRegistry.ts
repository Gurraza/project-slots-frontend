import { ExplodeAndCascadeFeature } from "./explodeandcascade";
import { PaylinesFeature } from "./paylinesfeature";
import { TransformFeature } from "./Transform";

export const featureRegistry = {
    'EXPLODE_AND_CASCADE_FEATURE': ExplodeAndCascadeFeature,
    'PAYLINES_FEATURE': PaylinesFeature,
    'TRANSFORM_FEATURE': TransformFeature
}