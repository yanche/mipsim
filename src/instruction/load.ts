
import { Register } from "../register";
import { Address } from "../address";
import { Integer } from "../constant";

// load the byte at addr into des
export class LB {
    constructor(public des: Register, public addr: Address) {

    }
}

// load the byte at addr into des
export class LBU {
    constructor(public des: Register, public addr: Address) {

    }
}

// load the halfword at addr into des
export class LH {
    constructor(public des: Register, public addr: Address) {

    }
}

// load the halfword at addr into des
export class LHU {
    constructor(public des: Register, public addr: Address) {

    }
}

// load the constant const into the upper halfword of des, and set the lower halfword of des to 0
export class LUI {
    constructor(public des: Register, public cons: Integer) {

    }
}

// load the word at addr into des
export class LW {
    constructor(public des: Register, public addr: Address) {

    }
}

// load the word at addr into des
export class LWL {
    constructor(public des: Register, public addr: Address) {

    }
}

// load the word at addr into des
export class LWR {
    constructor(public des: Register, public addr: Address) {

    }
}
