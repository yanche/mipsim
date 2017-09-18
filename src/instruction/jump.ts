
import { Register } from "../register";

// jump to label lab
export class J {
    constructor(public lab: string) {

    }
}

// jump to location src1
export class JR {
    constructor(public src1: Register) {

    }
}

// jump to label lab, and store the address of the next instruction in $ra
export class JAL {
    constructor(public lab: string) {

    }
}

// jump to location src1, and store the address of the next instruction in $ra
export class JALR {
    constructor(public src1: Register) {

    }
}
