
import { testMIPSParsing2 } from "./util";

describe("simple code parsing test", () => {
    it("simple instructions", () => {
        const code = `
        main:
        ori $t1, $r0, 10
        ori $t2, $r0, 15
        add $t3, $t1, $t2
        `;
        testMIPSParsing2(code, [
            "ori $t1, $r0, 10",
            "ori $t2, $r0, 15",
            "add $t3, $t1, $t2"
        ], "0x00400004", new Map<string, number>());
    });

    it("branch instructions", () => {
        const code = `
        main:
        beq $t1, $t2, label
        ori $t1, $t1, 10
        j end
        label:
        ori $t2, $t2, 15
        end:
        add $t3, $t1, $t2
        `;
        const labelMap = new Map<string, number>();
        labelMap.set("label", parseInt("0x00400010", 16));
        labelMap.set("end", parseInt("0x00400014", 16));
        testMIPSParsing2(code, [
            "beq $t1, $t2, label",
            "ori $t1, $t1, 10",
            "j end",
            "ori $t2, $t2, 15", // 0x00400010
            "add $t3, $t1, $t2" // 0x00400014
        ], "0x00400004", labelMap);
    });
});
