import assert from 'assert';
import {parseCode, runManage ,code} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('empty', () => {
        runManage(parseCode(''));
        assert(JSON.stringify(code) === '[]');
    });
    // it('let', () => {
    //     runManage(parseCode('1\n' +
    //         'function foo(x){\n' +
    //         '    let a = x + 1;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x) {\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('ass + seq + return', () => {
    //     runManage(parseCode('1\n' +
    //         'function foo(x){\n' +
    //         '    let a = x + 1;\n' +
    //         'a = 1;\n' +
    //         'a = 1, a = x;\n' +
    //         'return a;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"    ","color":"white"},{"str":"","color":"white"},{"str":"    return (x);\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // // it('++', () => {
    // //     runManage(parseCode('[1,2,3]\n' +
    // //         'function foo(x){\n' +
    // //         'let a = 1;\n' +
    // //         'let b = a+1;\n' +
    // //         'return a;\n' +
    // //         '}\n' +
    // //         '\n'));
    // //     assert(JSON.stringify(code) === '[{"str":"function foo (x) {\\n","color":"white"},{"str":"    return 1;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // // });
    // it('member', () => {
    //     runManage(parseCode('[1,2,3]\n' +
    //         'function foo(x){\n' +
    //         'let a = [1, 2, 3];\n' +
    //         'a[0] = 3;\n' +
    //         'a[1] = [1,2,3];\n' +
    //         'return a;\n' +
    //         '}\n'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"    ","color":"white"},{"str":"    return 3,([1, 2, 3]),3;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('while', () => {
    //     runManage(parseCode('[1,2,3]\n' +
    //         'function foo(x){\n' +
    //         'while(x[1] < x[2]){\n' +
    //         'return 1;\n' +
    //         '}\n' +
    //         '}\n' +
    //         '\n'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x) {\\n","color":"white"},{"str":"    while (x[1]<x[2]) {\\n","color":"white"},{"str":"        return 1;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('logic', () => {
    //     runManage(parseCode('1, 2, 3\n' +
    //         'function foo(x, y, z){\n' +
    //         'while(x && y){\n' +
    //         'return x;\n' +
    //         '}\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y, z) {\\n","color":"white"},{"str":"    while ((x&&y)) {\\n","color":"white"},{"str":"        return x;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('if', () => {
    //     runManage(parseCode('1, 2, 3\n' +
    //         'function foo(x, y, z){\n' +
    //         'if(x && y){\n' +
    //         'return x;\n' +
    //         '}\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y, z) {\\n","color":"white"},{"str":"    if ((x&&y)) {\\n","color":"green"},{"str":"        return x;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('let null', () => {
    //     runManage(parseCode('1\n' +
    //         'let x;'));
    //     assert(JSON.stringify(code) === '[]');
    // });
    // it('allIf', () => {
    //     runManage(parseCode('1, 2, 3\n' +
    //         'function foo(x, y, z){\n' +
    //         'if(x < y){\n' +
    //         'return x+1;\n' +
    //         '}\n' +
    //         'else if(x < y){\n' +
    //         'return x+1;\n' +
    //         '}\n' +
    //         'else if(x < y){\n' +
    //         'return x+1;\n' +
    //         '}\n' +
    //         'else{\n' +
    //         'if(x < y){\n' +
    //         'return x+1;\n' +
    //         '}\n' +
    //         'else{\n' +
    //         'return 1;\n' +
    //         '}\n' +
    //         '}\n' +
    //         '}\n' +
    //         '\n'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y, z) {\\n","color":"white"},{"str":"    if (x<y) {\\n","color":"green"},{"str":"        return x+1;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"    else if (x<y) {\\n","color":"green"},{"str":"        return x+1;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"    else if (x<y) {\\n","color":"green"},{"str":"        return x+1;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"    else {\\n","color":"white"},{"str":"        if (x<y) {\\n","color":"green"},{"str":"            return x+1;\\n","color":"white"},{"str":"        }\\n","color":"white"},{"str":"        else {\\n","color":"white"},{"str":"            return 1;\\n","color":"white"},{"str":"        }\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('with params', () => {
    //     runManage(parseCode('[3]\n' +
    //         'function foo(z){\n' +
    //         '    z = 1;\n' +
    //         '\n' +
    //         '}\n'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (z) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"z = 1;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('with params', () => {
    //     runManage(parseCode('1, 2, [3]\n' +
    //         'function foo(x, y, z){\n' +
    //         '    y = 7, z = 2;\n' +
    //         '\n' +
    //         '}\n'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y, z) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"","color":"white"},{"str":"y = 7, ","color":"white"},{"str":"z = 2;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('red', () => {
    //     runManage(parseCode('[3]\n' +
    //         'function foo(z){\n' +
    //         '    if(3 < 1){\n' +
    //         'return -1;\n' +
    //         '}\n' +
    //         '\n' +
    //         '}\n'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (z) {\\n","color":"white"},{"str":"    if (false) {\\n","color":"red"},{"str":"        return -1;\\n","color":"white"},{"str":"    }\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('arr.length', () => {
    //     runManage(parseCode('1, 2\n' +
    //         'function foo(x, y){\n' +
    //         'return arr.length;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y) {\\n","color":"white"},{"str":"    return arr.length;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('unary not number', () => {
    //     runManage(parseCode('1, 2\n' +
    //         'function foo(x, y){\n' +
    //         'return -x;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y) {\\n","color":"white"},{"str":"    return -x;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('++', () => {
    //     runManage(parseCode('1, 2\n' +
    //         'function foo(x, y){\n' +
    //         'let a = 3;\n' +
    //         'a++, x++;\n' +
    //         'return ++a;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"","color":"white"},{"str":"x++;\\n","color":"white"},{"str":"    return 5;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('++', () => {
    //     runManage(parseCode('1, 2\n' +
    //         'function foo(x, y){\n' +
    //         'let a = 3;\n' +
    //         'x++, x++;\n' +
    //         'return ++a;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"","color":"white"},{"str":"x++, ","color":"white"},{"str":"x++;\\n","color":"white"},{"str":"    return 4;\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('++', () => {
    //     runManage(parseCode('1, 2\n' +
    //         'function foo(x, y){\n' +
    //         'let y = s++;\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y) {\\n","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
    // it('arr', () => {
    //     runManage(parseCode('1, [2]\n' +
    //         'function foo(x, y){\n' +
    //         'y = [1, 2];\n' +
    //         '}'));
    //     assert(JSON.stringify(code) === '[{"str":"function foo (x, y) {\\n","color":"white"},{"str":"    ","color":"white"},{"str":"}\\n","color":"white"}]');
    // });
});
