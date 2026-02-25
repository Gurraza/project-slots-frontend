import { ClusterFeature } from "./clusterfeature";
import { PaylinesFeature } from "./paylinesfeature";
import { TransformFeature } from "./Transform";

export const featureRegistry = {
    'CLUSTER_FEATURE': ClusterFeature,
    'PAYLINES_FEATURE': PaylinesFeature,
    'TRANSFORM_FEATURE': TransformFeature
}