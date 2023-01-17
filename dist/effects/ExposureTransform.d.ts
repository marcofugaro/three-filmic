import { Effect } from 'postprocessing';
export declare class ExposureTransform extends Effect {
    static readonly FRAG: string;
    constructor(exposure?: number);
    get exposure(): number;
    set exposure(exposure: number);
}
