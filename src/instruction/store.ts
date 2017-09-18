
import { Register } from "../register";
import { Address } from "../address";

// store the lower byte of register src1 to addr
export class SB {
    constructor(public src1: Register, public addr: Address) {

    }
}

// store the lower halfword of register src1 to addr
export class SH {
    constructor(public src1: Register, public addr: Address) {

    }
}

// store the word in register src1 to addr
export class SW {
    constructor(public src1: Register, public addr: Address) {

    }
}

// store the upper halfword in src1 to the (possibly unaligned) address addr
export class SWL {
    constructor(public src1: Register, public addr: Address) {

    }
}

// store the lower halfword in src to the (possibly unaligned) address addr
export class SWR {
    constructor(public src1: Register, public addr: Address) {

    }
}
