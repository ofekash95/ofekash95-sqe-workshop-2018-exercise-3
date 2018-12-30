import assert from 'assert';
import {parseCode, runManage ,cfg} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('empty', () => {
        runManage(parseCode(''));
        assert(JSON.stringify(cfg) === '[]');
    });
    it('empty', () => {
        runManage(parseCode('1\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = x+1\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1, b = 7;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = x+1\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"b = 7\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '  x = 4;\n' +
            'y = 3, z = 2;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = x+1\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"x = 4","pointsTo":[2,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"y = 3","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"z = 2","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1\n' +
            'function foo(x, y, z){\n' +
            '    let a = [1,2,3];\n' +
            'a = [1,2,3];\n' +
            'y = 3, x = 5;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = [1, 2, 3]\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"a = [1, 2, 3]\\n","pointsTo":[2,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"y = 3","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"x = 5","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1\n' +
            'function foo(x){\n' +
            ' return x;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"return x\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1\n' +
            'function foo(x){\n' +
            'let a = [1,2,3];\n' +
            'a[1] = 4;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = [1, 2, 3]\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"a[1] = 4","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            '   while (x < z) {\n' +
            '       x = 5;\n' +
            '   }\n' +
            '   return z;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"NULL","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":0,"textCode":"x<z","pointsTo":[2,3],"arrowType":[1,0]},{"color":"green","type":1,"textCode":"x = 5","pointsTo":[0,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return z\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            '   if (x < z) {\n' +
            '       x = 5;\n' +
            '   }\n' +
            'else if(x > z){\n' +
            'x = 6;\n' +
            '}\n' +
            'else\n' +
            'x = 7;\n' +
            '   return z;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":0,"textCode":"x<z","pointsTo":[1,2],"arrowType":[1,0]},{"color":"green","type":1,"textCode":"x = 5","pointsTo":[5,496351],"arrowType":[2,2]},{"color":"white","type":0,"textCode":"x>z","pointsTo":[3,4],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"x = 6","pointsTo":[5,496351],"arrowType":[2,2]},{"color":"white","type":1,"textCode":"x = 7","pointsTo":[5,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[6,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return z\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            '   if (x < z) {\n' +
            '       x = 5;\n' +
            '   }\n' +
            'else if(x > z){\n' +
            'x = 6;\n' +
            '}\n' +
            'else if(x === z)\n' +
            'x = 7;\n' +
            '   return z;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":0,"textCode":"x<z","pointsTo":[1,2],"arrowType":[1,0]},{"color":"green","type":1,"textCode":"x = 5","pointsTo":[6,496351],"arrowType":[2,2]},{"color":"white","type":0,"textCode":"x>z","pointsTo":[3,4],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"x = 6","pointsTo":[6,496351],"arrowType":[2,2]},{"color":"white","type":0,"textCode":"x===z","pointsTo":[5,6],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"x = 7","pointsTo":[6,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[7,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return z\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            '   if (x < z) {\n' +
            '       x = 5;\n' +
            '   }\n' +
            'else \n' +
            'x = 6;\n' +
            '   return z;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":0,"textCode":"x<z","pointsTo":[1,2],"arrowType":[1,0]},{"color":"green","type":1,"textCode":"x = 5","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"white","type":1,"textCode":"x = 6","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[4,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return z\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            '  x = -1;\n' +
            'if(x && y)\n' +
            'x = 8;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"x = -1","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":0,"textCode":"(x&&y)","pointsTo":[2,3],"arrowType":[1,0]},{"color":"green","type":1,"textCode":"x = 8","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            ' let c = [1,2,3]\n' +
            'if(x && c.length)\n' +
            'x = c[1];\n' +
            'x= -x;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"c = [1, 2, 3]\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":0,"textCode":"(x&&c.length)","pointsTo":[2,3],"arrowType":[1,0]},{"color":"green","type":1,"textCode":"x = c[1]","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[4,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"x = -x","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            ' let c = [1,2,3]\n' +
            'if(x > y){\n' +
            'while(x > y)\n' +
            'x = 4;\n' +
            '}\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"c = [1, 2, 3]\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":0,"textCode":"x>y","pointsTo":[2,5],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"NULL","pointsTo":[3,5],"arrowType":[2,2]},{"color":"white","type":0,"textCode":"x>y","pointsTo":[4,496351],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"x = 4","pointsTo":[2,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            ' let c = [1,2,3]\n' +
            'if(x > y){\n' +
            'x = 4;\n' +
            '}\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"c = [1, 2, 3]\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":0,"textCode":"x>y","pointsTo":[2,3],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"x = 4","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, 3\n' +
            'function foo(x, y, z){\n' +
            ' let c = [1,2,3]\n' +
            'if(x > y){\n' +
            'if(x > 4){\n' +
            'x = 6;\n' +
            '}\n' +
            '}\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"c = [1, 2, 3]\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":0,"textCode":"x>y","pointsTo":[2,5],"arrowType":[1,0]},{"color":"white","type":0,"textCode":"x>4","pointsTo":[3,4],"arrowType":[1,0]},{"color":"white","type":1,"textCode":"x = 6","pointsTo":[4,5],"arrowType":[2,2]},{"color":"white","type":2,"textCode":"","pointsTo":[5,496351],"arrowType":[2,2]},{"color":"green","type":2,"textCode":"","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, [1,2,3]\n' +
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '  x = 4;\n' +
            'y = 3, z = 2;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = x+1\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"x = 4","pointsTo":[2,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"y = 3","pointsTo":[3,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"z = 2","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, [1,2,3]\n' +
            'let a = 4;\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = 4\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, [1,2,3]\n' +
            'function foo(x, y, z){\n' +
            '    let a;\n' +
            'return a;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return a\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, [1,2,3]\n' +
            'function foo(x, y, z){\n' +
            '    let a;\n' +
            'return a++;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return a\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, [1,2,3]\n' +
            'function foo(x, y, z){\n' +
            '    let a = x++;\n' +
            'return a++;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = x\\n","pointsTo":[1,496351],"arrowType":[2,2]},{"color":"green","type":1,"textCode":"return a\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
    it('empty', () => {
        runManage(parseCode('1, 2, [1,2,3]\n' +
            'function foo(x, y, z){\n' +
            '    let a = ++x;\n' +
            '}\n'));
        assert(JSON.stringify(cfg) === '[{"color":"green","type":1,"textCode":"a = x+1\\n","pointsTo":[496351,496351],"arrowType":[2,2]}]');
    });
});
