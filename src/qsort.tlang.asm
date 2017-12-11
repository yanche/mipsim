.data
__newline__:
.asciiz "\n"

__true__:
.asciiz "true"

__false__:
.asciiz "false"

.text
fnlabel_0:
###pre-defined function of print_int###
lw $a0, 4($sp)
li $v0, 1
syscall
jr $ra

fnlabel_1:
###pre-defined function of print_bool###
lw $a0, 4($sp)
beqz $a0, __print_false__
la $a0, __true__
b __end_print_bool__
__print_false__:
la $a0, __false__
__end_print_bool__:
li $v0, 4
syscall
jr $ra

fnlabel_2:
###pre-defined function of print_newline###
la $a0, __newline__
li $v0, 4
syscall
jr $ra

main:
jal fnlabel_6
li $v0, 10
###EXIT PROGRAM###
syscall

fnlabel_3:
###qsort:[int]:int:int###
sw $ra, -28($sp)
sw $fp, -32($sp)
sw $t0, 0($sp)
sw $t1, -4($sp)
sw $t2, -8($sp)
sw $t3, -12($sp)
sw $t4, -16($sp)
sw $t5, -20($sp)
sw $t6, -24($sp)
add $fp, $sp, -36
lw $t1, 4($sp)
lw $t3, 8($sp)
lw $t2, 12($sp)
add $sp, $sp, -36
slt $t0, $t3, $t2
bne $t0, $zero, label_0
b label_5
label_0:
mulo $t0, $t2, 4
add $t0, $t1, $t0
lw $t0, 0($t0)
move $t6, $t0
move $t5, $t3
move $t4, $t3
label_1:
slt $t0, $t5, $t2
beq $t0, $zero, label_4
mulo $t0, $t5, 4
add $t0, $t1, $t0
lw $t0, 0($t0)
slt $t0, $t0, $t6
bne $t0, $zero, label_2
b label_3
label_2:
sw $t4, 0($sp)
subu $sp, $sp, 4
sw $t5, 0($sp)
subu $sp, $sp, 4
sw $t1, 0($sp)
subu $sp, $sp, 4
jal fnlabel_4
addu $sp, $sp, 12
li $t0, 1
add $t0, $t4, $t0
move $t4, $t0
label_3:
li $t0, 1
add $t0, $t5, $t0
move $t5, $t0
b label_1
label_4:
sw $t2, 0($sp)
subu $sp, $sp, 4
sw $t4, 0($sp)
subu $sp, $sp, 4
sw $t1, 0($sp)
subu $sp, $sp, 4
jal fnlabel_4
addu $sp, $sp, 12
li $t0, 1
sub $t0, $t4, $t0
sw $t0, 0($sp)
subu $sp, $sp, 4
sw $t3, 0($sp)
subu $sp, $sp, 4
sw $t1, 0($sp)
subu $sp, $sp, 4
jal fnlabel_3
addu $sp, $sp, 12
li $t0, 1
add $t0, $t4, $t0
sw $t2, 0($sp)
subu $sp, $sp, 4
sw $t0, 0($sp)
subu $sp, $sp, 4
sw $t1, 0($sp)
subu $sp, $sp, 4
jal fnlabel_3
addu $sp, $sp, 12
label_5:
nop
fnlabel_3_return:
lw $ra, 8($fp)
lw $t6, 12($fp)
lw $t5, 16($fp)
lw $t4, 20($fp)
lw $t3, 24($fp)
lw $t2, 28($fp)
lw $t1, 32($fp)
lw $t0, 36($fp)
add $sp, $fp, -36
lw $fp, 4($fp)
jr $ra

fnlabel_4:
###swap:[int]:int:int###
sw $ra, -20($sp)
sw $fp, -24($sp)
sw $t0, 0($sp)
sw $t1, -4($sp)
sw $t2, -8($sp)
sw $t3, -12($sp)
sw $t4, -16($sp)
add $fp, $sp, -28
lw $t1, 4($sp)
lw $t3, 8($sp)
lw $t2, 12($sp)
add $sp, $sp, -28
sne $t0, $t3, $t2
bne $t0, $zero, label_6
b label_7
label_6:
mulo $t0, $t3, 4
add $t0, $t1, $t0
lw $t0, 0($t0)
move $t4, $t0
mulo $t0, $t2, 4
add $t0, $t1, $t0
lw $t0, 0($t0)
mulo $t3, $t3, 4
add $t3, $t1, $t3
sw $t0, 0($t3)
mulo $t0, $t2, 4
add $t0, $t1, $t0
sw $t4, 0($t0)
label_7:
nop
fnlabel_4_return:
lw $ra, 8($fp)
lw $t4, 12($fp)
lw $t3, 16($fp)
lw $t2, 20($fp)
lw $t1, 24($fp)
lw $t0, 28($fp)
add $sp, $fp, -28
lw $fp, 4($fp)
jr $ra

fnlabel_5:
###printarr:[int]:int:int###
sw $ra, -16($sp)
sw $fp, -20($sp)
sw $t0, 0($sp)
sw $t1, -4($sp)
sw $t2, -8($sp)
sw $t3, -12($sp)
add $fp, $sp, -24
lw $t3, 4($sp)
lw $t1, 8($sp)
lw $t2, 12($sp)
add $sp, $sp, -24
label_8:
sle $t0, $t1, $t2
beq $t0, $zero, label_9
mulo $t0, $t1, 4
add $t0, $t3, $t0
lw $t0, 0($t0)
sw $t0, 0($sp)
subu $sp, $sp, 4
jal fnlabel_0
addu $sp, $sp, 4
jal fnlabel_2
li $t0, 1
add $t0, $t1, $t0
move $t1, $t0
b label_8
label_9:
nop
fnlabel_5_return:
lw $ra, 8($fp)
lw $t3, 12($fp)
lw $t2, 16($fp)
lw $t1, 20($fp)
lw $t0, 24($fp)
add $sp, $fp, -24
lw $fp, 4($fp)
jr $ra

fnlabel_6:
###main###
sw $ra, -12($sp)
sw $fp, -16($sp)
sw $t0, 0($sp)
sw $t1, -4($sp)
sw $t2, -8($sp)
add $fp, $sp, -20
add $sp, $sp, -20
li $a0, 40
li $v0, 9
syscall
move $t0, $v0
move $t2, $t0
li $t0, 5
li $t1, 0
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 1
li $t1, 4
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 2
li $t1, 8
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 7
li $t1, 12
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, -5
li $t1, 16
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 30
li $t1, 20
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 21
li $t1, 24
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 99
li $t1, 28
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 2
li $t1, 32
add $t1, $t2, $t1
sw $t0, 0($t1)
li $t0, 0
li $t1, 36
add $t1, $t2, $t1
sw $t0, 0($t1)
li $v0, 9
sw $v0, 0($sp)
subu $sp, $sp, 4
li $v0, 0
sw $v0, 0($sp)
subu $sp, $sp, 4
sw $t2, 0($sp)
subu $sp, $sp, 4
jal fnlabel_3
addu $sp, $sp, 12
li $v0, 9
sw $v0, 0($sp)
subu $sp, $sp, 4
li $v0, 0
sw $v0, 0($sp)
subu $sp, $sp, 4
sw $t2, 0($sp)
subu $sp, $sp, 4
jal fnlabel_5
addu $sp, $sp, 12
fnlabel_6_return:
lw $ra, 8($fp)
lw $t2, 12($fp)
lw $t1, 16($fp)
lw $t0, 20($fp)
add $sp, $fp, -20
lw $fp, 4($fp)
jr $ra
