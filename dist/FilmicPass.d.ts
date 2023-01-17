import { Camera, DataTexture, Data3DTexture } from 'three';
import { Effect, EffectPass, LookupTexture } from 'postprocessing';
import { View } from './constants';
export declare class FilmicPass extends EffectPass {
    private _view;
    private _filmicLUT;
    private _falseColorLUT;
    private _lookLUT;
    private _prevEffects;
    private _exposureTransform;
    constructor(camera: Camera, ...effects: Effect[]);
    /**************************************************************************
     * Configuration.
     */
    get view(): View;
    set view(view: View);
    get exposure(): number;
    set exposure(exposure: number);
    /**************************************************************************
     * LUTs.
     */
    get filmicLUT(): Data3DTexture | LookupTexture;
    set filmicLUT(lut: Data3DTexture | LookupTexture);
    get falseColorLUT(): Data3DTexture | LookupTexture;
    set falseColorLUT(lut: Data3DTexture | LookupTexture);
    get lookLUT(): DataTexture;
    set lookLUT(lut: DataTexture);
    /**************************************************************************
     * Internal.
     */
    recompile(): void;
}
