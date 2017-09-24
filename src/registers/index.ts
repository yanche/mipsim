
import { Word, HalfWord } from "../def";
import { byte, flatten } from "../utility";

interface Register {
    name: string;
    value: Word;
}

export enum REG {
    STATUS = -7,
    BADVADDR = -6,
    CAUSE = -5,
    EPC = -4,
    LO = -3,
    HI = -2,
    PC = -1,
    ZERO = 0,
    AT = 1,
    V0 = 2,
    V1 = 3,
    A0 = 4,
    A1 = 5,
    A2 = 6,
    A3 = 7,
    T0 = 8,
    T1 = 9,
    T2 = 10,
    T3 = 11,
    T4 = 12,
    T5 = 13,
    T6 = 14,
    T7 = 15,
    S0 = 16,
    S1 = 17,
    S2 = 18,
    S3 = 19,
    S4 = 20,
    S5 = 21,
    S6 = 22,
    S7 = 23,
    T8 = 24,
    T9 = 25,
    K0 = 26,
    K1 = 27,
    GP = 28,
    SP = 29,
    FP = 30,
    RA = 31
}

export class Registers {
    private _map: Map<number, Register>;
    private _word4: Word;

    public advancePC(): void {
        // PC = PC + 4
        this.setVal(REG.PC, byte.bitsAdd(this.getVal(REG.PC), this._word4).result);
    }

    public advancePC16BitsOffset(offset: HalfWord): void {
        const neg = offset[0];
        const prefix = neg ? byte.makeTrueArray(14) : byte.makeFalseArray(14);
        this.setVal(REG.PC, byte.bitsAdd(this.getVal(REG.PC), <Word>prefix.concat(offset).concat([false, false])).result);
    }

    public getVal(regnum: number): Word {
        const reg = this._map.get(regnum);
        if (reg) {
            return <Word>flatten(reg.value);
        } else {
            throw new Error(`reg not found: ${regnum}`);
        }
    }

    public setVal(regnum: number, word: Word): void {
        const reg = this._map.get(regnum);
        if (reg) {
            reg.value = <Word>flatten(word);
        } else {
            throw new Error(`reg not found: ${regnum}`);
        }
    }

    constructor() {
        this._map = new Map<number, Register>();
        this._map.set(REG.STATUS, {
            name: "status",
            value: byte.makeWord0()
        });
        this._map.set(REG.BADVADDR, {
            name: "badvaddr",
            value: byte.makeWord0()
        });
        this._map.set(REG.CAUSE, {
            name: "cause",
            value: byte.makeWord0()
        });
        this._map.set(REG.EPC, {
            name: "epc",
            value: byte.makeWord0()
        });
        this._map.set(REG.LO, {
            name: "lo",
            value: byte.makeWord0()
        });
        this._map.set(REG.HI, {
            name: "hi",
            value: byte.makeWord0()
        });
        this._map.set(REG.PC, {
            name: "pc",
            value: byte.makeWord0()
        });
        this._map.set(REG.ZERO, {
            name: "zero",
            value: byte.makeWord0()
        });
        this._map.set(REG.AT, {
            name: "at",
            value: byte.makeWord0()
        });
        this._map.set(REG.V0, {
            name: "v0",
            value: byte.makeWord0()
        });
        this._map.set(REG.V1, {
            name: "v1",
            value: byte.makeWord0()
        });
        this._map.set(REG.A0, {
            name: "a0",
            value: byte.makeWord0()
        });
        this._map.set(REG.A1, {
            name: "a1",
            value: byte.makeWord0()
        });
        this._map.set(REG.A2, {
            name: "a2",
            value: byte.makeWord0()
        });
        this._map.set(REG.A3, {
            name: "a3",
            value: byte.makeWord0()
        });
        this._map.set(REG.T0, {
            name: "t0",
            value: byte.makeWord0()
        });
        this._map.set(REG.T1, {
            name: "t1",
            value: byte.makeWord0()
        });
        this._map.set(REG.T2, {
            name: "t2",
            value: byte.makeWord0()
        });
        this._map.set(REG.T3, {
            name: "t3",
            value: byte.makeWord0()
        });
        this._map.set(REG.T4, {
            name: "t4",
            value: byte.makeWord0()
        });
        this._map.set(REG.T5, {
            name: "t5",
            value: byte.makeWord0()
        });
        this._map.set(REG.T6, {
            name: "t6",
            value: byte.makeWord0()
        });
        this._map.set(REG.T7, {
            name: "t7",
            value: byte.makeWord0()
        });
        this._map.set(REG.S0, {
            name: "s0",
            value: byte.makeWord0()
        });
        this._map.set(REG.S1, {
            name: "s1",
            value: byte.makeWord0()
        });
        this._map.set(REG.S2, {
            name: "s2",
            value: byte.makeWord0()
        });
        this._map.set(REG.S3, {
            name: "s3",
            value: byte.makeWord0()
        });
        this._map.set(REG.S4, {
            name: "s4",
            value: byte.makeWord0()
        });
        this._map.set(REG.S5, {
            name: "s5",
            value: byte.makeWord0()
        });
        this._map.set(REG.S6, {
            name: "s6",
            value: byte.makeWord0()
        });
        this._map.set(REG.S7, {
            name: "s7",
            value: byte.makeWord0()
        });
        this._map.set(REG.T8, {
            name: "t8",
            value: byte.makeWord0()
        });
        this._map.set(REG.T9, {
            name: "t9",
            value: byte.makeWord0()
        });
        this._map.set(REG.K0, {
            name: "k0",
            value: byte.makeWord0()
        });
        this._map.set(REG.K1, {
            name: "k1",
            value: byte.makeWord0()
        });
        this._map.set(REG.GP, {
            name: "gp",
            value: byte.makeWord0()
        });
        this._map.set(REG.SP, {
            name: "sp",
            value: byte.makeWord0()
        });
        this._map.set(REG.FP, {
            name: "fp",
            value: byte.makeWord0()
        });
        this._map.set(REG.RA, {
            name: "ra",
            value: byte.makeWord0()
        });
        this._word4 = byte.makeWord0();
        this._word4[29] = true;
    }
}
