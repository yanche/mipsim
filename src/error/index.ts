
export class MIPSError extends Error {
    constructor(msg: string, public errcode: number) {
        super(msg);
    }

    public lineNum: number;
}

export const SyntaxErrorCode = {
    UNKNOWN_INSTRUCTION: 1000,
    INVALID_REGISTER: 1001,
    INACCESSIBLE_REGISTER: 1002,
    SYNTAX_ERROR: 1003,
    LABEL_NOT_FOUND: 1004,
    UNEXPECTED_COMPONENT: 1005,
    UNKNOWN_PSEUDO_INSTRUCTION: 1006,
    INVALID_COMPONENT: 1007,
    BRANCH_ONLY_LABEL: 1008,
    NUM_OVERFLOW: 1009,
    NO_ENTRY: 1010,
    UNKNOWN_ASSEMBLY: 1011,
    LABEL_DECLARED: 1012,
    INVALID_LABEL: 1013,
    INSTRUCTION_DATA_SEGMENT: 1014,
    INVALID_ASSEMBLY: 1015,
    INVALID_NUM: 1016,
    IMM_NOT_INTEGER: 1017,
}

export const RuntimeErrorCode = {
    UNKNOWN_INSTRUCTION: 2000,
    NOT_YET_IMPLEMENTED: 2001,
    REG_NOT_FOUND: 2002,
    UNALIGNED_MEM_ACCESS: 2003,
    ARITHMETIC_OVERFLOW: 2004,
    INVALID_SYSCALL_CODE: 2005,
}
