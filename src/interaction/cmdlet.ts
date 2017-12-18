
import * as readline from "readline";
import * as fs from "fs";
import { Program } from "../program";
import { DirtyInfo, byte } from "../utility";
import { Word, Byte } from "../def";
import { getRegName, getAllRegNums, REG } from "../registers";
import * as _console from "../console";

_console.use((input: string | number) => process.stdout.write(input.toString()));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let program: Program;
let programCode: string[];

_console.write(">");
rl.on("line", processInput);

function processInput(originInput: string) {
    const input = originInput.trim();
    const spaceIdx = input.indexOf(" ");
    let directive: string, rest: string;
    if (spaceIdx < 0) {
        directive = input;
        rest = "";
    } else {
        directive = input.slice(0, spaceIdx);
        rest = input.slice(spaceIdx + 1).trim();
    }
    switch (directive) {
        case "reset":
            program = new Program(programCode);
            break;
        case "l":
        case "load":
            _console.write(`loading file: ${rest}\n`);
            const data = fs.readFileSync(rest, "utf-8");
            _console.write(`loaded file: ${rest}\n`);
            programCode = data.split("\r\n");
            // console.info(code.length, code.slice(0, 5));
            program = new Program(programCode);
            break;
        case "r":
        case "run":
            program.run();
            break;
        case "c":
        case "code": {
            const pc = program.regs.getVal(REG.PC);
            const code = program.getSource(byte.bitsToNum(pc, false));
            _console.write(`0x${byte.wordToHexString(pc)}: ${code.source}${code.originSource ? ` (${code.originSource}  @${code.pseudoConvIdx})` : ""}\n`);
            break;
        }
        case "s":
        case "step": {
            program.step();
            const dirty = program.getDirtyInfo();
            dirty.regs.forEach(logRegDirty);
            dirty.mem.forEach(logMemDirty);
            const pc = program.regs.getVal(REG.PC);
            const code = program.getSource(byte.bitsToNum(pc, false));
            _console.write(`next:\n`);
            _console.write(`0x${byte.wordToHexString(pc)}: ${code.source}${code.originSource ? ` (${code.originSource}  @${code.pseudoConvIdx})` : ""}\n`);
            break;
        }
        case "regs": {
            const regs = program.regs;
            getAllRegNums().forEach(reg => {
                _console.write(`$${getRegName(reg)}: 0x${byte.wordToHexString(regs.getVal(reg))}\n`);
            });
            break;
        }
        case "q":
        case "quit":
            process.exit(0);
            break;
        default: _console.write(`unknown command: ${originInput}\n`);
    }
    _console.write(">");
}

function logRegDirty(dirtyInfo: DirtyInfo<number, Word>) {
    _console.write(`$${getRegName(dirtyInfo.key)}: 0x${byte.wordToHexString(dirtyInfo.old)} -> 0x${byte.wordToHexString(dirtyInfo.new)}\n`)
}

function logMemDirty(dirtyInfo: DirtyInfo<number, Byte>) {
    const addrHex = byte.wordToHexString((<Word>byte.bitsNumFill(byte.numToBits(dirtyInfo.key).result, 32, false).bits));
    _console.write(`0x${addrHex}: 0x${byte.byteToHexString(dirtyInfo.old)} -> 0x${byte.byteToHexString(dirtyInfo.new)}\n`)
}
