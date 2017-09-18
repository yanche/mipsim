
import { Register } from "../register";

// copy the contents of the hi register to des
export class MFHI {
    constructor(public des: Register) {

    }
}

// copy the contents of the lo register to des
export class MFLO {
    constructor(public des: Register) {

    }
}

// copy the contents of the src1 to hi
export class MTHI {
    constructor(public src1: Register) {

    }
}

// copy the contents of the src1 to lo
export class MTLO {
    constructor(public src1: Register) {

    }
}
