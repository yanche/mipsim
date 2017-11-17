
import { testMIPSParsing2 } from "./util";

describe("simple code parsing test", () => {
    it("simple instructions", () => {
        const code = `
        main:
        ori $t1 $r0 10
        ori $t2 $r0 15
        add $t3 $t1 $t2
        `;
        testMIPSParsing2(code, [
            "ori $t1 $r0 10",
            "ori $t2 $r0 15",
            "add $t3 $t1 $t2"
        ], "0x00400004", new Map<string, number>());
    });

    it("branch instructions", () => {
        const code = `
        main:
        beq $t1 $t2 label
        ori $t1 $t1 10
        j end
        label:
        ori $t2 $t2 15
        end:
        add $t3 $t1 $t2
        `;
        const labelMap = new Map<string, number>();
        labelMap.set("label", parseInt("0x00400010", 16));
        labelMap.set("end", parseInt("0x00400014", 16));
        testMIPSParsing2(code, [
            "beq $t1 $t2 label",
            "ori $t1 $t1 10",
            "j end",
            "ori $t2 $t2 15", // 0x00400010
            "add $t3 $t1 $t2" // 0x00400014
        ], "0x00400004", labelMap);
    });
});

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
            li $t0, -10
            `;
        testMIPSParsing2(code, [
            "ori $t0, $r0, 100",
            "lui $t1, 10",
            "ori $t1, $t1, 40",
            "lui $t1, -1",
            "ori $t1, $t1, -10"
        ], "0x00400004", new Map<string, number>(), true);
    });
});
