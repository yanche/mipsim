
import { addu } from "../../arithmetic";
import { getRegBitStr, testWordWithBitString } from "../util";

describe("parsing", () => {
    // $t0 = $t1 + $t2
    // addu $t0 $t1 $t2
    // addu $d, $s, $t
    it("addu $t0, $t1, $t2", () => {
        testWordWithBitString(addu.parse("$t0, $t1, $t2", 0, null), `000000${getRegBitStr("t1")}${getRegBitStr("t2")}${getRegBitStr("t0")}00000100001`);
    });
});
