
import { Block } from "./mblock";
import { Addr, Word, Byte, HalfWord, memBlockSize, Bit } from "../def";
import { byte, validate, flatten, DirtyTracker, DirtyInfo } from "../utility";

const bsize = Math.log2(memBlockSize);
if (!validate.num(bsize, validate.NUM_FLAG.INT | validate.NUM_FLAG.POS)) {
    throw new Error(`memory block size must be an exponential number to 2: ${memBlockSize}`);
}
const maxBlockSeq = Math.pow(2, 32 - bsize) - 1;

export class Memory {
    private _map: Map<number, Block>;
    private _dirtyTracker: DirtyTracker<number, Byte>;

    public readByte(addr: Addr): Byte {
        return <Byte>this._blockOp(addr, 1);
    }

    public readWord(addr: Addr): Word {
        return <Word>this._blockOp(addr, 4);
    }

    public writeByte(addr: Addr, byte: Byte): void {
        this._blockOp(addr, 1, byte);
    }

    public writeHalfWord(addr: Addr, halfword: HalfWord): void {
        this._blockOp(addr, 2, halfword);
    }

    public writeWord(addr: Addr, word: Word): void {
        this._blockOp(addr, 4, word);
    }

    public clearDirty() {
        this._dirtyTracker.clear();
    }

    public getDirtyInfo(): DirtyInfo<number, Byte>[] {
        return this._dirtyTracker.getDirtyInfo();
    }

    // BIG ENDIAN
    private _blockOp(addr: Addr, byteLen: number, writingData?: Bit[]): Bit[] {
        let blockSeq = this._blockSeq(addr);
        let blockOffset = this._blockOffset(addr);
        let result: Bit[][] = [];
        let writingDataOffset = 0;
        while (byteLen > 0) {
            const blockHitBytes = Math.min(byteLen, memBlockSize - blockOffset);
            const block = this._getOrCreateBlock(blockSeq);
            if (writingData) {
                block.write(blockOffset, writingData.slice(writingDataOffset, writingDataOffset += blockHitBytes * 8), this._dirtyTracker);
            } else {
                result.push(block.read(blockOffset, blockHitBytes));
            }
            byteLen -= blockHitBytes;
            // go to next consecutive block
            blockSeq++;
            blockOffset = 0;
        }
        return flatten(result);
    }

    private _getOrCreateBlock(blockSeq: number): Block {
        if (blockSeq > maxBlockSeq) {
            throw new Error(`block sequence exceeds the maximum: ${blockSeq}, max: ${maxBlockSeq}`);
        }
        if (!this._map.has(blockSeq)) {
            this._map.set(blockSeq, new Block(memBlockSize, blockSeq * memBlockSize));
        }
        return this._map.get(blockSeq);
    }

    private _blockOffset(addr: Addr): number {
        return byte.bitsToNum(addr.slice(-bsize), false);
    }

    private _blockSeq(addr: Addr): number {
        return byte.bitsToNum(addr.slice(0, -bsize), false);
    }

    constructor() {
        this._map = new Map<number, Block>();
        this._dirtyTracker = new DirtyTracker<number, Byte>((v1: Byte, v2: Byte) => byte.bitsEqual(v1, v2).equal);
    }
}
