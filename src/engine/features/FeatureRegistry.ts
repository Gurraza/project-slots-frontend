import { ExplodeAndCascadeFeature } from "./explodeandcascade";
import { FlyingNumberOnRemove } from "./flyingNumberOnRemove";
import { PaylinesFeature } from "./paylinesfeature";
import { SpinButtonFeature } from "./spinbutton";
import { TransformFeature } from "./transform";

export const featureRegistry = {
    'EXPLODE_AND_CASCADE_FEATURE': ExplodeAndCascadeFeature,
    'PAYLINES_FEATURE': PaylinesFeature,
    'TRANSFORM_FEATURE': TransformFeature,
    'SPIN_BUTTON_FEATURE': SpinButtonFeature,
    'FLYING_NUMBER_FEATURE': FlyingNumberOnRemove
}