
import { Integer } from "../constant";

// return from exception
export class RFE {
    constructor() {

    }
}

// makes a system call
export class SYSCALL {
    constructor() {

    }
}

// used by the debugger
export class BREAK {
    constructor(public cons: Integer) {

    }
}

// no operation
export class NOP {
    constructor() {

    }
}
