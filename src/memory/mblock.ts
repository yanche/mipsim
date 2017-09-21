
import { validate } from "../utility";

export class Block {
    private _size: number;
    // number is the unsigned presentation of byte, from 0 ~ 255
    private _data: Array<number>;

    get size(): number {
        return this._size;
    }

    // size: number of bytes
    constructor(size: number) {
        if (!validate.num(size, validate.NUM_FLAG.POS | validate.NUM_FLAG.INT)) {
            throw new Error(`size of block must be an positive integer: ${size}`);
        }
        this._size = size;
        this._data = new Array<number>(size);
    }
}
