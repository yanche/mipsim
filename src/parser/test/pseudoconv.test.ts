
import { testMIPSParsing2 } from "./util";

describe("pseudo instructions", () => {
    it("abs", () => {
        const code = `
            main:
            abs $t0, $t1
            `;
        testMIPSParsing2(code, [
            "addu $t0, $r0, $t1",
            "bgez $t1, 8",
            "sub $t0, $r0, $t1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("div(u)", () => {
        const code = `
            main:
            div $t0, $t1, $t3
            divu $t0, $t1, $t3
            `;
        testMIPSParsing2(code, [
            "bne $t3, $r0, 8",
            "break",
            "div $t1, $t3",
            "mflo $t0",
            "bne $t3, $r0, 8",
            "break",
            "divu $t1, $t3",
            "mflo $t0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("mul", () => {
        const code = `
            main:
            mul $t0, $t1, $t3
            `;
        testMIPSParsing2(code, [
            "mult $t1, $t3",
            "mflo $t0",
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("mulo", () => {
        const code = `
            main:
            mulo $t0, $t1, $t3
            `;
        testMIPSParsing2(code, [
            "mult $t1, $t3",
            "mfhi $at",
            "mflo $t0",
            "sra $t0, $t0, 31",
            "beq $at, $t0, 8",
            "break",
            "mflo $t0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("neg(u)", () => {
        const code = `
            main:
            neg $t0, $t1
            negu $t0, $t1
            `;
        testMIPSParsing2(code, [
            "sub $t0, $r0, $t1",
            "subu $t0, $r0, $t1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("not", () => {
        const code = `
            main:
            not $t0, $t1
            `;
        testMIPSParsing2(code, [
            "xor $t0, $t1, $r0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("rem(u)", () => {
        const code = `
            main:
            rem $t0, $t1, $t2
            remu $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "bne $t2, $r0, 8",
            "break",
            "div $t1, $t2",
            "mfhi $t0",
            "bne $t2, $r0, 8",
            "break",
            "divu $t1, $t2",
            "mfhi $t0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("rol", () => {
        const code = `
            main:
            rol $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "subu $at, $r0, $t2",
            "srlv $at, $t1, $at",
            "sllv $t0, $t1, $t2",
            "or $t0, $t0, $at"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("ror", () => {
        const code = `
            main:
            ror $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "subu $at, $r0, $t2",
            "sllv $at, $t1, $at",
            "srlv $t0, $t1, $t2",
            "or $t0, $t0, $at"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("seq", () => {
        const code = `
            main:
            seq $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "beq $t2, $t1, 12",
            "ori $t0, $r0, 0",
            "beq $r0, $r0, 8",
            "ori $t0, $r0, 1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("sne", () => {
        const code = `
            main:
            sne $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "beq $t2, $t1, 12",
            "ori $t0, $r0, 1",
            "beq $r0, $r0, 8",
            "ori $t0, $r0, 0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("sge(u)", () => {
        const code = `
            main:
            sge $t0, $t1, $t2
            sgeu $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "bne $t2, $t1, 12",
            "ori $t0, $r0, 1",
            "beq $r0, $r0, 8",
            "slt $t0, $t2, $t1",
            "bne $t2, $t1, 12",
            "ori $t0, $r0, 1",
            "beq $r0, $r0, 8",
            "sltu $t0, $t2, $t1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("sgt(u)", () => {
        const code = `
            main:
            sgt $t0, $t1, $t2
            sgtu $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "slt $t0, $t2, $t1",
            "sltu $t0, $t2, $t1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("sle(u)", () => {
        const code = `
            main:
            sle $t0, $t1, $t2
            sleu $t0, $t1, $t2
            `;
        testMIPSParsing2(code, [
            "bne $t2, $t1, 12",
            "ori $t0, $r0, 1",
            "beq $r0, $r0, 8",
            "slt $t0, $t1, $t2",
            "bne $t2, $t1, 12",
            "ori $t0, $r0, 1",
            "beq $r0, $r0, 8",
            "sltu $t0, $t1, $t2"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("bge(u)", () => {
        const code = `
            main:
            bge $t0, $t1, end
            bgeu $t0, $t1, end
            end:
            add $t0, $t1, $t2
            `;
        const labelMap = new Map<string, number>();
        labelMap.set("end", parseInt("0x00400014", 16));
        testMIPSParsing2(code, [
            "slt $at, $t0, $t1",
            "beq $at, $r0, 12",
            "sltu $at, $t0, $t1",
            "beq $at, $r0, 4",
            "add $t0, $t1, $t2"
        ], "0x00400004", labelMap, true);
    });

    it("bgt(u)", () => {
        const code = `
            main:
            bgt $t0, $t1, end
            bgtu $t0, $t1, end
            end:
            add $t0, $t1, $t2
            `;
        const labelMap = new Map<string, number>();
        labelMap.set("end", parseInt("0x00400014", 16));
        testMIPSParsing2(code, [
            "slt $at, $t1, $t0",
            "bne $at, $r0, 12",
            "sltu $at, $t1, $t0",
            "bne $at, $r0, 4",
            "add $t0, $t1, $t2"
        ], "0x00400004", labelMap, true);
    });

    it("ble(u)", () => {
        const code = `
            main:
            ble $t0, $t1, end
            bleu $t0, $t1, end
            end:
            add $t0, $t1, $t2
            `;
        const labelMap = new Map<string, number>();
        labelMap.set("end", parseInt("0x00400014", 16));
        testMIPSParsing2(code, [
            "slt $at, $t1, $t0",
            "beq $at, $r0, 12",
            "sltu $at, $t1, $t0",
            "beq $at, $r0, 4",
            "add $t0, $t1, $t2"
        ], "0x00400004", labelMap, true);
    });

    it("blt(u)", () => {
        const code = `
            main:
            blt $t0, $t1, end
            bltu $t0, $t1, end
            end:
            add $t0, $t1, $t2
            `;
        const labelMap = new Map<string, number>();
        labelMap.set("end", parseInt("0x00400014", 16));
        testMIPSParsing2(code, [
            "slt $at, $t0, $t1",
            "bne $at, $r0, 12",
            "sltu $at, $t0, $t1",
            "bne $at, $r0, 4",
            "add $t0, $t1, $t2"
        ], "0x00400004", labelMap, true);
    });

    it("beqz", () => {
        const code = `
            main:
            beqz $t0, main
            `;
        testMIPSParsing2(code, [
            "beq $t0, $r0, 0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("bnez", () => {
        const code = `
            main:
            bnez $t0, main
            `;
        testMIPSParsing2(code, [
            "bne $t0, $r0, 0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("li", () => {
        const code = `
            main:
            li $t0, 100
            li $t1, 655400
            li $t2, -10
            li $t3, -655400
            li $t4, 65535
            `;
        testMIPSParsing2(code, [
            "ori $t0, $r0, 100",
            "lui $t1, 10",
            "ori $t1, $t1, 40",
            "lui $t2, -1",
            "ori $t2, $t2, -10",
            "lui $t3, -11",
            "ori $t3, $t3, -40",
            "ori $t4, $r0, -1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("move", () => {
        const code = `
            main:
            move $t0, $t1
            `;
        testMIPSParsing2(code, [
            "addu $t0, $r0, $t1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("la (reg)", () => {
        const code = `
            main:
            la $t0, ($t1)
            `;
        testMIPSParsing2(code, [
            "addi $t0, $t1, 0"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("la const, equivalent to li", () => {
        const code = `
            main:
            la $t1, 100
            la $t2, 655400
            la $t3, -10
            la $t4, -655400
            la $t5, 65535
            `;
        testMIPSParsing2(code, [
            "ori $t1, $r0, 100",
            "lui $t2, 10",
            "ori $t2, $t2, 40",
            "lui $t3, -1",
            "ori $t3, $t3, -10",
            "lui $t4, -11",
            "ori $t4, $t4, -40",
            "ori $t5, $r0, -1"
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("la const(reg)", () => {
        const code = `
            main:
            la $t0, 100($t4)
            la $t1, 655400($t4)
            la $t2, -10($t4)
            la $t3, -655400($t4)
            la $t5, 65535($t4)
            `;
        testMIPSParsing2(code, [
            "addi $t0, $t4, 100",
            "lui $at, 10",
            "ori $at, $at, 40",
            "add $t1, $t4, $at",
            "addi $t2, $t4, -10",
            "lui $at, -11",
            "ori $at, $at, -40",
            "add $t3, $t4, $at",
            "ori $at, $r0, -1",
            "add $t5, $t4, $at",
        ], "0x00400004", new Map<string, number>(), true);
    });

    it("la label + const", () => {
        const code = `
            main:
            la $t3, main
            la $t0, main + 100
            la $t1, main + 655400
            la $t2, main - 10
            `;
        testMIPSParsing2(code, [
            "lui $at, 64",
            "ori $t3, $at, 4",
            "lui $at, 64",
            "ori $t0, $at, 104",
            "lui $at, 74",
            "ori $t1, $at, 44",
            "lui $at, 63",
            "ori $t2, $at, -6",
        ], "0x00400004", new Map<string, number>().set("main", parseInt("0x00400004", 16)), true);
    });

    it("la label + const(reg)", () => {
        const code = `
            main:
            la $t0, main + 100($t3)
            la $t1, main + 655400($t3)
            la $t2, main - 10($t3)
            `;
        testMIPSParsing2(code, [
            "lui $at, 64",
            "ori $at, $at, 104",
            "add $t0, $t3, $at",
            "lui $at, 74",
            "ori $at, $at, 44",
            "add $t1, $t3, $at",
            "lui $at, 63",
            "ori $at, $at, -6",
            "add $t2, $t3, $at",
        ], "0x00400004", new Map<string, number>().set("main", parseInt("0x00400004", 16)), true);
    });
});