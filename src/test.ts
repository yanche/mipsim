
import * as fs from "fs";
import { Program } from "./program";
import * as _console from "./console";

_console.use((input: string | number) => process.stdout.write(input.toString()));

fs.readFile("./qsort.tlang.asm", (err, data) => {
    if (err) {
        console.error(err);
    } else {
        const code = data.toString("utf-8").split("\r\n");
        console.info(code.length, code.slice(0, 5));
        const program = new Program(code);
        program.run();
        console.log("exec done");
    }
});
