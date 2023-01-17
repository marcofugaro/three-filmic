import { Effect } from 'postprocessing';
import { Matrix4 } from 'three';
export declare class MatrixTransform extends Effect {
    static readonly FRAG: string;
    readonly matrix: Matrix4;
    constructor(matrix: Matrix4);
}
