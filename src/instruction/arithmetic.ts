
import { Register } from "../register";
import { Integer } from "../constant";

// des gets src1 + src2
export class ADD {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets src1 + src2
export class ADDU {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets the bitwise and of src1 and src2
export class AND {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// divide src1 by reg2, leaving the quotient in register lo and the remainder in register hi
export class DIV {
    constructor(public src1: Register, public reg2: Register) {

    }
}

// divide src1 by reg2, leaving the quotient in register lo and the remainder in register hi
export class DIVU {
    constructor(public src1: Register, public reg2: Register) {

    }
}

// multiply src1 and reg2, leaving the low-order word in register lo and the high-order word in register hi
export class MULT {
    constructor(public src1: Register, public reg2: Register) {

    }
}

// multiply src1 and reg2, leaving the low-order word in register lo and the high-order word in register hi
export class MULTU {
    constructor(public src1: Register, public reg2: Register) {

    }
}

// des gets the bitwise logical nor of src1 and src2
export class NOR {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets the bitwise logical or of src1 and src2.
export class OR {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets src1 shifted left by src2 bits
export class SLL {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets src1 shifted right (arithmetic) by src2 bits
export class SRA {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets src1 shifted right (logical) by src2 bits
export class SRL {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets src1 - src2
export class SUB {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets src1 - src2
export class SUBU {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets the bitwise exclusive or of src1 and src2
export class XOR {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}
