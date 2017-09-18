
export class Register {
    private _num: number;
    private _name: string;

    toString(): string {
        return "$" + this._name;
    }

    constructor(num: number, name: string) {
        this._name = name;
        this._num = num;
    }
}

export const REGS = {
    zero: makeReg(0, "zero"),
    at: makeReg(1, "at"),
    v0: makeReg(2, "v0"),
    v1: makeReg(3, "v1"),
    a0: makeReg(4, "a0"),
    a1: makeReg(5, "a1"),
    a2: makeReg(6, "a2"),
    a3: makeReg(7, "a3"),
    t0: makeReg(8, "t0"),
    t1: makeReg(9, "t1"),
    t2: makeReg(10, "t2"),
    t3: makeReg(11, "t3"),
    t4: makeReg(12, "t4"),
    t5: makeReg(13, "t5"),
    t6: makeReg(14, "t6"),
    t7: makeReg(15, "t7"),
    s0: makeReg(16, "s0"),
    s1: makeReg(17, "s1"),
    s2: makeReg(18, "s2"),
    s3: makeReg(19, "s3"),
    s4: makeReg(20, "s4"),
    s5: makeReg(21, "s5"),
    s6: makeReg(22, "s6"),
    s7: makeReg(23, "s7"),
    t8: makeReg(24, "t8"),
    t9: makeReg(25, "t9"),
    k0: makeReg(26, "k0"),
    k1: makeReg(27, "k1"),
    gp: makeReg(28, "gp"),
    sp: makeReg(29, "sp"),
    fp: makeReg(30, "fp"),
    ra: makeReg(31, "ra"),
};

function makeReg(num: number, name: string): Register {
    return new Register(num, name);
}
