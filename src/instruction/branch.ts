
import { Register } from "../register";
import { Integer } from "../constant";

// unconditional branch to label lab
export class B {
    constructor(public lab: string) {

    }
}

// branch to lab if src1 == src2
export class BEQ {
    constructor(public src1: Register, public src2: Register | Integer, public lab: string) {

    }
}

// branch to lab if src1 != src2
export class BNE {
    constructor(public src1: Register, public src2: Register | Integer, public lab: string) {

    }
}

// branch to lab if src1 >= 0
export class BGEZ {
    constructor(public src1: Register, public lab: string) {

    }
}

// branch to lab if src1 > 0
export class BGTZ {
    constructor(public src1: Register, public lab: string) {

    }
}

// branch to lab if src1 <= 0
export class BLEZ {
    constructor(public src1: Register, public lab: string) {

    }
}

// branch to lab if src1 < 0
export class BLTZ {
    constructor(public src1: Register, public lab: string) {

    }
}

// if src1 >= 0, then put the address of the next instruction into $ra and branch to lab
export class BGEZAL {
    constructor(public src1: Register, public lab: string) {

    }
}

// if src1 > 0, then put the address of the next instruction into $ra and branch to lab
export class BGTZAL {
    constructor(public src1: Register, public lab: string) {

    }
}

// if src1 < 0, then put the address of the next instruction into $ra and branch to lab
export class BLTZAL {
    constructor(public src1: Register, public lab: string) {

    }
}
