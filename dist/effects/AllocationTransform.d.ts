import { Effect } from 'postprocessing';
import { Vector2 } from 'three';
import { Allocation } from '../constants';
interface AllocationOptions {
    allocation: Allocation;
    domain: Vector2;
    range: Vector2;
    inverse: boolean;
}
export declare class AllocationTransform extends Effect {
    static readonly FRAG: string;
    constructor(options?: Partial<AllocationOptions>);
}
export {};
