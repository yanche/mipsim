
import { validate } from "../utility";
import { Bit } from "../def";

export class Block {
    private _size: number;
    // number is the unsigned presentation of byte, from 0 ~ 255
    private _data: Array<Bit>;

    get size(): number {
        return this._size;
    }

    public read(offset: number, bytes: number): Bit[] {
        const end = offset + bytes;
        if (end >= this.size) {
            throw new Error(`reading block exceeds block boundary, from: ${offset}, to ${end}, block size: ${this.size}`);
        }
        return this._data.slice(offset * 8, end * 8);
    }

    public write(offset: number, bits: Bit[]): void {
        const start = offset * 8;
        const end = start + bits.length;
        if (end > this.size * 8) {
            throw new Error(`writing block exceeds block boundary, from: ${offset}, to ${end / 8}, block size: ${this.size}`);
        }
        for (let i = 0; i < bits.length; ++i) {
            this._data[start + i] = bits[i];
        }
    }

    // size: number of bytes
    constructor(size: number) {
        if (!validate.num(size, validate.NUM_FLAG.POS | validate.NUM_FLAG.INT)) {
            throw new Error(`size of block must be an positive integer: ${size}`);
        }
        this._size = size;
        this._data = new Array<Bit>(size * 8);
    }
}
