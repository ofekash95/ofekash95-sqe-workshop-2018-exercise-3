import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

export {parseCode, runManage, cfg};

//pointers param: 'pointerOf' , 'color' , 'arrowType' , 'isInFirstPointTo'
//arrowType: 0 -> F, 1 -> T, 2 -> none
//type: 0 -> diamond, 1 -> rectangle, 2 -> circle


let tmpEnv = [], cfg = [];

function runManage(obj){
    cfg = [];
    program([], obj);
}

function addToCfg(color, type, textCode, pointsTo, arrowType){
    cfg = cfg.concat({'color' : color, 'type' : type, 'textCode' : textCode, 'pointsTo' : pointsTo,
        'arrowType' : arrowType});
}

function setPointTo(indPointer, indToPoint, isInFirstPointTo){
    if(indPointer >= 0)
        cfg[indPointer].pointsTo[isInFirstPointTo? 0 : 1] = indToPoint;
}

function getValByVar(env, vr){
    for(let i = 0; i < env.length; ++i)
        if(env[i].var === vr)
            return env[i].val;
    return null;
}

function setArrVal(env, vr, newVl, index){
    let vl = getValByVar(env, vr);
    if(vl === null)
        return;
    let arr = eval(vl);
    arr[index] = newVl;
    extendEnv(env, vr, arr);
}

function toWrap(vl){
    return (typeof vl !== 'number' && typeof vl !== 'object') ? '(' + vl + ')' : vl;
}

function extendEnv(env, vr, vl){
    vl = toWrap(vl);
    if(vr.includes('[')){
        let name = vr.substring(0, vr.indexOf('['));
        let index = vr.substring(vr.indexOf('[') + 1, vr.indexOf(']'));
        setArrVal(env, name, vl, index);
    }
    for(let i = 0; i < env.length; ++i){
        if(env[i].var === vr){
            env[i].val = vl;
            return env;
        }
    }
    return env.concat({'var' : vr, 'val' : vl});
}

function updateEnv(env){
    for(let i = 0; i < tmpEnv.length; ++i){
        env = extendEnv(env, tmpEnv[i].var, tmpEnv[i].val);
    }
    tmpEnv = [];
    return env;
}

function makeEnv(env){
    return JSON.parse(JSON.stringify(env));
}

function convertToVal(env, obj){
    for(let i = 0; i < env.length; ++i){
        if(env[i].var === obj)
            return env[i].val;
    }
    return obj;
}

function regArgExpression(env, vr, vl){
    return extendEnv(env, vr.name, getVal([], vl, true));
}

function arrayArgExpression(env, vr, vl){
    let val = '[', tmpVal, i = 0, length = vl.elements.length;
    while(i < length){
        tmpVal = getVal([], vl.elements[i], true);
        val += tmpVal + ((i+1 < length) ? ', ' : ']');
        extendEnv(env, vr.name + '[' + i + ']', tmpVal);
        ++i;
    }
    return extendEnv(env, vr.name, val);
}

function handleValues(obj){
    return obj.type === 'SequenceExpression' ? obj.expressions : [obj];
}

function handleArgs(env, vars, values){
    values = handleValues(values.expression);
    for(let i = 0; i < values.length; ++i) {
        let vr = vars[i], vl = values[i];
        env = (vl.type === 'ArrayExpression') ? arrayArgExpression(env, vr, vl) : regArgExpression(env, vr, vl);
    }
    return env;
}

function handleCfg(pointer, textCode, type, arrowType){
    addToCfg(pointer.color, type, textCode, [496351, 496351], arrowType);
    setPointTo(pointer.pointerOf, cfg.length - 1, pointer.isInFirstPointTo);
}

function program(env, obj) {
    cfg = [];
    let pointer = {'pointerOf' : -1, 'color' : 'green', 'isInFirstPointTo' : true}, output = [env, pointer];
    for(let i = 1; i < obj.body.length; ++i)
        output = obj.body[i].type === 'FunctionDeclaration' ? funcDec(output[0], obj.body[i], obj.body[0], output[1])
            : objMap(output[0], obj.body[i], output[1]);
    return output[0];
}

function objMap (env, nextObj, pointer) {
    let handlers = {'VariableDeclaration' : varDec, 'IfStatement' : ifStatement,
        'ExpressionStatement': expressionStatement, 'SequenceExpression' : sequenceExpression,
        'ReturnStatement' : returnStatement, 'WhileStatement' : whileStatement, 'BlockStatement' : blockStatement};
    // if(handlers[nextObj.type] !== undefined)
    return handlers[nextObj.type](env, nextObj, pointer);
}

function funcDec(env, obj, valArgs, pointer) {
    env = handleArgs(env, obj.params, valArgs);
    let output = objMap(env, obj.body, pointer);
    output[1].pointerOf = cfg.length - 1;
    return output;
}

function arrayVarDec(env, obj, pointer){
    let val = '[', strVal = '[', tmpVal, strTmpVal, i = 0, length = obj.init.elements.length;
    while(i < length){
        tmpVal = getVal(env, obj.init.elements[i], true);
        strTmpVal = getVal(env, obj.init.elements[i], false);
        env = updateEnv(extendEnv(env, obj.id.name + '[' + i + ']', tmpVal));
        val += tmpVal + ((++i < length) ? ', ' : ']');
        strVal += strTmpVal + ((i < length) ? ', ' : ']');
    }
    let textCode = obj.id.name + ' = ' + strVal + '\n';
    handleCfg(pointer, textCode, 1, [2,2]);
    pointer.pointerOf = cfg.length - 1;
    return [extendEnv(env, obj.id.name, val), pointer];
}

function regVarDec(env, obj, pointer){
    let textCode = obj.id.name + ((obj.init === null) ? '' : (' = ' + getVal(env, obj.init, false))) + '\n';
    handleCfg(pointer, textCode, 1, [2,2]);
    pointer.pointerOf = cfg.length - 1;
    return [updateEnv(extendEnv(env, obj.id.name, obj.init === null ? null : getVal(env, obj.init, true))), pointer];
}

function varDec(env, obj, pointer){
    let output = [env, pointer];
    for(let i = 0; i < obj.declarations.length; ++i){
        let nextObj = obj.declarations[i], init = nextObj.init;
        output = (init === null || init.type !== 'ArrayExpression') ? regVarDec(output[0], nextObj, output[1]) :
            arrayVarDec(output[0], nextObj, output[1]);
    }
    return output;
}

function returnStatement(env, obj, pointer){
    let textCode = 'return ' + getVal(env, obj.argument, false) + '\n';
    handleCfg(pointer, textCode, 1, [2,2]);
    pointer.pointerOf = cfg.length - 1;
    return [updateEnv(env), pointer];
}

function arrayExpression(env, obj, objName , isSeq, pointer){
    let rightObj = obj.right, length = rightObj.elements.length, val = '[', strVal = '[', tmpVal, strTmpVal, i = 0;
    while (i < length) {
        tmpVal = getVal(env, rightObj.elements[i], true);
        strTmpVal = getVal(env, rightObj.elements[i], false);
        let x = extendEnv(env, objName + '[' + i + ']', tmpVal);
        env = updateEnv(x);
        val += tmpVal + ((++i < length) ? ', ' : ']');
        strVal += strTmpVal + ((i < length) ? ', ' : ']');
    }
    let textCode = objName + ' = ' + strVal + '\n';
    handleCfg(pointer, textCode, 1, [2,2]);
    pointer.pointerOf = cfg.length - 1;
    return [extendEnv(env, objName, val), pointer];
}

function regExpression(env, obj, objName, isSeq, pointer){
    let val = getVal(env, obj.right, true), textCode = objName + ' = ' + getVal(env, obj.right, false);
    handleCfg(pointer, textCode, 1, [2,2]);
    pointer.pointerOf = cfg.length - 1;
    return [updateEnv(extendEnv(env, objName, val)), pointer];
}

function assignmentExpression (env, obj, isSeq, pointer) {
    let objName = (obj.left.type === 'MemberExpression') ? handleMemberExpression(env, obj.left) : obj.left.name;
    return obj.right.type === 'ArrayExpression' ? arrayExpression(env, obj, objName, isSeq, pointer) :
        regExpression(env, obj, objName, isSeq, pointer);
}

// function updateExpression(env, obj, isSeq, pointer){
//     let op = obj.operator, vr = obj.argument.name, strTmpVal = getVal(env, obj.argument, false),
//         textCode =  obj.argument.prefix ? op + strTmpVal + '' : strTmpVal + op + '',
//         vl = getVal(env, obj.argument, true);
//     handleCfg(pointer, textCode, 1, [2,2]);
//     pointer.pointerOf = length - 1;
//     return [updateEnv(extendEnv(env, vr, vl)), pointer];
// }

function handleExp(env, obj, isSeq, pointer){
    return obj.type === 'AssignmentExpression' ? assignmentExpression(env, obj, isSeq, pointer) :
        // obj.type === 'UpdateExpression' ? updateExpression(env, obj, isSeq, pointer) :
        objMap(env, obj, pointer);
}

function expressionStatement(env, exp, pointer){
    return handleExp(env, exp.expression, false, pointer);
}

function sequenceExpression(env, exp, pointer){
    let i = 0, length = exp.expressions.length, output = [env, pointer];
    while(i < length)
        output = handleExp(output[0], exp.expressions[i++], i < length, output[1]);
    return output;
}

function blockStatement(env, obj, pointer){
    let output = [env, pointer];
    for(let i = 0; i < obj.body.length; ++i)
        output = objMap(output[0], obj.body[i], output[1]);
    return output;
}

function setPointersToCircleFirstPoints(cfgPointer, isEntered){
    if(cfgPointer.pointsTo[0] === 496351){
        cfgPointer.pointsTo[0] = cfg.length;
        isEntered = true;
    }
    else if(cfgPointer.type === 0)
        makeCircleHelper(cfgPointer.pointsTo[0]);
    return isEntered;
}

function setPointersToCircleSecondPoints(cfgPointer, isEntered){
    if(!isEntered && cfgPointer.pointsTo[1] === 496351)
        cfgPointer.pointsTo[1] = cfg.length;
    else if(!isEntered && cfgPointer.type === 0)
        makeCircleHelper(cfgPointer.pointsTo[1]);
}

function setPointersToCircle(ind){
    let cfgPointer = cfg[ind];
    let isEntered = setPointersToCircleFirstPoints(cfgPointer, false);
    setPointersToCircleSecondPoints(cfgPointer, isEntered);
}

function makeCircle(x){
    makeCircleHelper(x);
    addToCfg(cfg[x].color, 2, '', [496351, 496351], [2,2]);
}

function makeCircleHelper(x){
    setPointersToCircle(x);
}

function handlePointers(test, pointer){
    return pointer.color === 'green' ?
        [{'pointerOf' : cfg.length, 'color' : test ? 'green' : 'white', 'isInFirstPointTo' : true},
            {'pointerOf' : cfg.length, 'color' : test ? 'white' : 'green', 'isInFirstPointTo' : false}] :
        [{'pointerOf' : cfg.length, 'color' : 'white', 'isInFirstPointTo' : true}, {'pointerOf' : cfg.length,
            'color' : 'white', 'isInFirstPointTo' : false}];
}

function ifStructure(env, obj, pointer) {
    let tEnv = makeEnv(env), test = getVal(tEnv, obj.test, true), strTest = getVal(tEnv, obj.test, false),
        pointers = handlePointers(test, pointer), alternate = obj.alternate;
    handleCfg(pointer, strTest.toString(), 0, [1,0]);
    let ind = cfg.length - 1;
    objMap(tEnv ,obj.consequent, pointers[0]);
    if(alternate !== null){
        alternate.type === 'IfStatement' ? elseIfStatement(env, alternate, pointers[1]) :
            elseStatement(env, alternate, pointers[1]);
    }
    return ind;
}

function ifStatement(env, obj, pointer){
    let x  = ifStructure(env, obj, pointer);
    makeCircle(x);
    pointer.pointerOf = cfg.length - 1;
    pointer.color = 'green';
    pointer.isInFirstPointTo = true;
    return [env, pointer];
}

function elseIfStatement(env, obj, pointer) {
    ifStructure(env, obj, pointer);
}

function elseStatement (env, obj, pointer){
    objMap(makeEnv(env), obj, pointer);
}

function whileStatement(env, obj, pointer){
    let tEnv = makeEnv(env), test = getVal(tEnv, obj.test, true), strTest = getVal(tEnv, obj.test, false);
    handleCfg(pointer, 'NULL', 1, [2, 2]);
    let indexOfNull = cfg.length - 1;
    pointer.pointerOf = indexOfNull;
    pointer.isInFirstPointTo = true;
    handleCfg(pointer, strTest, 0, [1,0]);
    let nextPointer = {'pointerOf' : cfg.length - 1, 'color' : test ? 'green' : 'white', 'isInFirstPointTo' : true};
    objMap(tEnv, obj.body, nextPointer);
    setPointTo(cfg.length - 1, indexOfNull, true);
    pointer.pointerOf = indexOfNull + 1;
    pointer.isInFirstPointTo = false;
    return [env, pointer];
}

function getVal(env, obj, toCalc){
    let handlers = { 'MemberExpression' : memberExpression, 'Literal' : literal, 'Identifier' : identifier,
        'UnaryExpression' : unaryExpression, 'BinaryExpression' : binaryExpression,
        'LogicalExpression' : logicalExpression, 'UpdateExpression' : updateExpressionForVal};
    return handlers[obj.type](env, obj, toCalc);
}

function literal(env, exp){
    return exp.value;
}

function identifier(env, exp, toCalc){
    return toCalc ? convertToVal(env, exp.name) : exp.name;
}

function unaryExpression(env, exp){
    let v1 = getVal(env, exp.argument), op = exp.operator, val = op + v1;
    return typeof v1 === 'number' ? eval(val) : val;
}

function binaryExpression(env, exp, toCalc){
    let valLeft = getVal(env, exp.left, toCalc), valRight = getVal(env, exp.right, toCalc),
        val = valLeft + exp.operator + valRight;
    return typeof valLeft === 'number' && typeof  valRight === 'number' ? eval(val) : val;
}

function logicalExpression(env, exp, toCalc){
    return '(' + getVal(env, exp.left, toCalc) + exp.operator + getVal(env, exp.right, toCalc) + ')';
}

function memberExpression(env, obj, toCalc){
    let x = handleMemberExpression(env, obj, toCalc);
    return toCalc ? convertToVal(env, x) : x;
}

function handleMemberExpression(env, obj, toCalc){
    let object = obj.object.name, property = getVal(env, obj.property, toCalc);
    return  obj.computed ? object + '[' + property + ']' : object + '.' + property;
}

function updateExpressionForVal(env, obj, toCalc){
    let vr = getVal(env, obj.argument, toCalc), vl = vr + obj.operator.charAt(0) + '1';
    vl = typeof (vr) === 'number' ? eval(vl) : vl;
    tmpEnv = tmpEnv.concat({'var' : obj.argument.name, 'val' : vl});
    return obj.prefix ? vl : vr;
}