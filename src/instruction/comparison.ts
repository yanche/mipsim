
import { Register } from "../register";
import { Integer } from "../constant";

// des gets 1 if src1 < src2, 0 otherwise
export class SLT {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}

// des gets 1 if src1 < src2, 0 otherwise
export class SLTU {
    constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

    }
}
