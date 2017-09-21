
import Registers from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

// $d = $s + $t
const add = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // let reg_s = bits5ToRegNum(itrn, 6);
        // let reg_t = bits5ToRegNum(itrn, 11);
        // let reg_d = bits5ToRegNum(itrn, 16);
        // regs.setVal(reg_d, regs.getVal(reg_s) + regs.getVal(reg_t))
    }
});

// $d = $s + $t
const addu = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0001",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        let reg_s = byte.bits5ToRegNum(itrn, 6);
        let reg_t = byte.bits5ToRegNum(itrn, 11);
        let reg_d = byte.bits5ToRegNum(itrn, 16);
        let add = byte.bitsAdd(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, <Word>add.result);
        regs.advancePC();
    }
});

// $t = $s + i
const addiu = new Instruction({
    pattern: "0010 01ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        let reg_s = byte.bits5ToRegNum(itrn, 6);
        let reg_t = byte.bits5ToRegNum(itrn, 11);
        let add = byte.bitsAdd(regs.getVal(reg_s), byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, <Word>add.result);
        regs.advancePC();
    }
});

export const finder = new InstructionFinder([add, addu, addiu]);

// des gets the bitwise and of src1 and src2
// export class AND {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // divide src1 by reg2, leaving the quotient in register lo and the remainder in register hi
// export class DIV {
//     constructor(public src1: Register, public reg2: Register) {

//     }
// }

// // divide src1 by reg2, leaving the quotient in register lo and the remainder in register hi
// export class DIVU {
//     constructor(public src1: Register, public reg2: Register) {

//     }
// }

// // multiply src1 and reg2, leaving the low-order word in register lo and the high-order word in register hi
// export class MULT {
//     constructor(public src1: Register, public reg2: Register) {

//     }
// }

// // multiply src1 and reg2, leaving the low-order word in register lo and the high-order word in register hi
// export class MULTU {
//     constructor(public src1: Register, public reg2: Register) {

//     }
// }

// // des gets the bitwise logical nor of src1 and src2
// export class NOR {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets the bitwise logical or of src1 and src2.
// export class OR {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets src1 shifted left by src2 bits
// export class SLL {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets src1 shifted right (arithmetic) by src2 bits
// export class SRA {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets src1 shifted right (logical) by src2 bits
// export class SRL {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets src1 - src2
// export class SUB {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets src1 - src2
// export class SUBU {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }

// // des gets the bitwise exclusive or of src1 and src2
// export class XOR {
//     constructor(public des: Register, public src1: Register, public src2: Register | Integer) {

//     }
// }
