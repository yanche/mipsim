
import { syscall } from "../../others";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";
import * as _console from "../../../console";
import { heapPointerAddr, heapPointerVal, dataStartAddr } from "../../../def";
import * as assert from "assert";

let dataToLog: string | number;
_console.use((input: string | number) => {
    dataToLog = input;
});

const heapInitVal = parseInt(heapPointerVal);
const dataAddr = parseInt(dataStartAddr);

describe("syscall test", () => {
    it("print 1", () => {
        singleInstructionTest(syscall, "", [
            [REG.PC, 4, 8],
            [REG.A0, 1, 1],
            [REG.V0, 1, 1],
        ]);
        assert.strictEqual(dataToLog, 1);
    });

    it("print 15", () => {
        singleInstructionTest(syscall, "", [
            [REG.PC, 4, 8],
            [REG.A0, 15, 15],
            [REG.V0, 1, 1],
        ]);
        assert.strictEqual(dataToLog, 15);
    });

    it("print -1", () => {
        singleInstructionTest(syscall, "", [
            [REG.PC, 4, 8],
            [REG.A0, -1, -1],
            [REG.V0, 1, 1],
        ]);
        assert.strictEqual(dataToLog, -1);
    });

    it("print \"abc\"", () => {
        // abc\0
        const stringInNum = ("a".charCodeAt(0) << 24) + ("b".charCodeAt(0) << 16) + ("c".charCodeAt(0) << 8);
        singleInstructionTest(syscall, "", [
            [REG.PC, 4, 8],
            [dataStartAddr, stringInNum, stringInNum],
            [REG.A0, dataAddr, dataAddr],
            [REG.V0, 4, 4],
        ]);
        assert.strictEqual(dataToLog, "abc");
    });

    it("sbrk 100", () => {
        singleInstructionTest(syscall, "", [
            [REG.PC, 4, 8],
            [heapPointerAddr, heapInitVal, heapInitVal + 100],
            [REG.A0, 100, 100],
            [REG.V0, 9, heapInitVal],
        ]);
    });

    it("sbrk -100", () => {
        singleInstructionTest(syscall, "", [
            [REG.PC, 4, 8],
            [heapPointerAddr, heapInitVal, heapInitVal - 100],
            [REG.A0, -100, -100],
            [REG.V0, 9, heapInitVal],
        ]);
    });
});
