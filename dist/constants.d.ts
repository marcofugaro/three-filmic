import { LookupTexture } from 'postprocessing';
import { DataTexture, Material } from 'three';
export declare type $TODO = any;
export declare enum View {
    NONE = 5000,
    FILMIC = 5001,
    FILMIC_LOG = 5002,
    FALSE_COLOR = 5003,
    GRAYSCALE = 5004
}
export declare enum Look {
    NONE = 5100,
    VERY_HIGH_CONTRAST = 5101,
    HIGH_CONTRAST = 5102,
    MEDIUM_HIGH_CONTRAST = 5103,
    MEDIUM_CONTRAST = 5100,
    MEDIUM_LOW_CONTRAST = 5104,
    LOW_CONTRAST = 5105,
    VERY_LOW_CONTRAST = 5106
}
export declare enum Allocation {
    UNIFORM = 5200,
    LG2 = 5201
}
export declare const DEFAULT_VIEW = View.FILMIC;
export declare const DEFAULT_EXPOSURE = 0;
export declare enum Defines {
    ALLOCATION = "FILMIC_ALLOCATION",
    INVERSE = "FILMIC_INVERSE"
}
export declare enum Uniforms {
    EXPOSURE = "exposure",
    MATRIX = "matrix",
    LUT = "lut",
    DOMAIN = "domain",
    RANGE = "range"
}
export declare const NEUTRAL_LUT_1D: DataTexture;
export declare const NEUTRAL_LUT_3D: LookupTexture;
export interface FullscreenMaterial extends Material {
    encodeOutput: boolean;
}
