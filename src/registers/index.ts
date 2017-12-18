
import { Word, HalfWord } from "../def";
import { byte, DirtyTracker, DirtyInfo } from "../utility";
import { MIPSError, RuntimeErrorCode } from "../error";

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
    R0 = 0,
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

const aliasMap = new Map<string, string>();
aliasMap.set("zero", "r0");

export function getRegNumber(regname: string): number {
    regname = (regname || "").toLowerCase();
    if (aliasMap.has(regname)) {
        regname = aliasMap.get(regname);
    }
    return nameMap.get(regname);
}

const nameMap = new Map<string, number>();
nameMap.set("status", REG.STATUS);
nameMap.set("badvaddr", REG.BADVADDR);
nameMap.set("cause", REG.CAUSE);
nameMap.set("epc", REG.EPC);
nameMap.set("lo", REG.LO);
nameMap.set("hi", REG.HI);
nameMap.set("pc", REG.PC);
nameMap.set("r0", REG.R0);
nameMap.set("at", REG.AT);
nameMap.set("v0", REG.V0);
nameMap.set("v1", REG.V1);
nameMap.set("a0", REG.A0);
nameMap.set("a1", REG.A1);
nameMap.set("a2", REG.A2);
nameMap.set("a3", REG.A3);
nameMap.set("t0", REG.T0);
nameMap.set("t1", REG.T1);
nameMap.set("t2", REG.T2);
nameMap.set("t3", REG.T3);
nameMap.set("t4", REG.T4);
nameMap.set("t5", REG.T5);
nameMap.set("t6", REG.T6);
nameMap.set("t7", REG.T7);
nameMap.set("s0", REG.S0);
nameMap.set("s1", REG.S1);
nameMap.set("s2", REG.S2);
nameMap.set("s3", REG.S3);
nameMap.set("s4", REG.S4);
nameMap.set("s5", REG.S5);
nameMap.set("s6", REG.S6);
nameMap.set("s7", REG.S7);
nameMap.set("t8", REG.T8);
nameMap.set("t9", REG.T9);
nameMap.set("k0", REG.K0);
nameMap.set("k1", REG.K1);
nameMap.set("gp", REG.GP);
nameMap.set("sp", REG.SP);
nameMap.set("fp", REG.FP);
nameMap.set("ra", REG.RA);

export class Registers {
    private _map: Map<number, Register>;
    private _word4: Word;
    private _dirtyTracker: DirtyTracker<number, Word>;

    public advancePC(): void {
        // PC = PC + 4
        this.setVal(REG.PC, byte.bitsAdd(this.getVal(REG.PC), this._word4).result);
    }

    public advancePC16BitsOffset(offset: HalfWord): void {
        const prefix = byte.makeArray(14, offset[0]);
        this.setVal(REG.PC, byte.bitsAdd(this.getVal(REG.PC), <Word>prefix.concat(offset).concat([false, false])).result);
    }

    public getVal(regnum: number): Word {
        const reg = this._map.get(regnum);
        if (reg) {
            return reg.value;
        } else {
            throw new MIPSError(`reg not found: ${regnum}`, RuntimeErrorCode.REG_NOT_FOUND);
        }
    }

    public setVal(regnum: number, word: Word): void {
        const reg = this._map.get(regnum);
        if (reg) {
            if (!byte.bitsEqual(reg.value, word).equal) {
                this._dirtyTracker.track(regnum, reg.value, word);
                reg.value = word;
            }
        } else {
            throw new MIPSError(`reg not found: ${regnum}`, RuntimeErrorCode.REG_NOT_FOUND);
        }
    }

    public clearDirty() {
        this._dirtyTracker.clear();
    }

    public getDirtyInfo(): DirtyInfo<number, Word>[] {
        return this._dirtyTracker.getDirtyInfo();
    }

    constructor() {
        this._map = new Map<number, Register>();
        for (let regs of nameMap) {
            this._map.set(regs[1], {
                name: regs[0],
                value: byte.makeWord0()
            });
        }
        this._word4 = byte.makeWord0();
        this._word4[29] = true;
        this._dirtyTracker = new DirtyTracker<number, Word>((v1: Word, v2: Word) => byte.bitsEqual(v1, v2).equal);
    }
}
