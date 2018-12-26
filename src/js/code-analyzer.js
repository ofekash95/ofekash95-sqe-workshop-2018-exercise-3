import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});
};

export {parseCode, runManage, code};

let paramEnv = [], tmpEnv = [], cond = [], code = [], fRun = true;

function runManage(objCode){
    code = [];
    fRun = true;
    program([], objCode, true);
    tmpEnv = [];
    fRun = false;
    program([], objCode, false);
}

function getValByVar(env, vr){
    for(let i = 0; i < env.length; ++i)
        if(env[i].var === vr)
            return env[i].val;
    return null;
}

function extendParamEnv(vr, vl){
    paramEnv = paramEnv.concat({'var' : vr, 'val' : vl});
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

function isParam(vr){
    for(let i = 0; i < paramEnv.length; ++i){
        if(paramEnv[i].var === vr)
            return true;
    }
    return false;
}

function handleParamEnv(env, vr, vl){
    for(let i = 0; i < paramEnv.length; ++i)
        if(paramEnv[i].var === vr){
            paramEnv[i].val = vl;
        }
    return env;
}

function handleRegEnv(env, vr, vl){
    if(vr.includes('[')){
        let name = vr.substring(0, vr.indexOf('['));
        let index = vr.substring(vr.indexOf('[') + 1, vr.indexOf(']'));
        setArrVal(env, name, vl, index);
    }
    for(let i = 0; i < env.length; ++i)
        if(env[i].var === vr){
            env[i].val = vl;
            return env;
        }
    return env.concat({'var' : vr, 'val' : vl});
}
function extendEnv(env, vr, vl){
    vl = toWrap(vl);
    return isParam(vr) && !fRun ? handleParamEnv(env, vr, vl) : handleRegEnv(env, vr, vl);
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


function convertToValReg(env, obj){
    for(let i = 0; i < env.length; ++i){
        if(env[i].var === obj)
            return env[i].val;
    }
    return obj;
}

function convertToValParam(obj){
    for(let i = 0; i < paramEnv.length; ++i){
        if(paramEnv[i].var === obj)
            return paramEnv[i].val;
    }
    return obj;
}

function convertToVal(env, obj){
    let x = convertToValReg(env, obj);
    return (fRun && x === obj) ? convertToValParam(obj) : x;
}

function doIndentation(numOfIndentation){
    let str = '';
    for(let i = 0; i < numOfIndentation; ++i)
        str += '    ';
    return str;
}

function program(env, obj, isFirstRun) {
    for(let i = 1; i < obj.body.length; ++i)
        env = obj.body[i].type === 'FunctionDeclaration' ? funcDec(env, obj.body[i], 0, obj.body[0], isFirstRun) :
            objMap(env, obj.body[i], 0, isFirstRun);
    return env;
}

function handleArgs(vars, values){
    values = handleValues(values.expression);
    for(let i = 0; i < values.length; ++i){
        let vr = vars[i], vl = values[i];
        vl.type === 'ArrayExpression' ? arrayArgExpression(vr, vl) : regArgExpression(vr, vl);
    }

}

function handleValues(obj){
    return obj.type === 'SequenceExpression' ? obj.expressions : [obj];
}

function regArgExpression(vr, vl){
    extendParamEnv(vr.name, getVal([], vl));
}

function arrayArgExpression(vr, vl){
    let val = '[', tmpVal, i = 0, length = vl.elements.length;
    while(i < length){
        tmpVal = getVal([], vl.elements[i]);
        val += tmpVal + ((i+1 < length) ? ', ' : ']');
        extendParamEnv(vr.name + '[' + i + ']', tmpVal);
        ++i;
    }
    extendParamEnv(vr.name, val);
}

function objMap (env, nextObj, numOfIndentation, isFirstRun) {
    let handlers = {'VariableDeclaration' : varDec, 'IfStatement' : ifStatement,
        'ExpressionStatement': expressionStatement, 'SequenceExpression' : sequenceExpression,
        'ReturnStatement' : returnStatement, 'WhileStatement' : whileStatement, 'BlockStatement' : blockStatement};
    // if(handlers[nextObj.type] !== undefined)
    return handlers[nextObj.type](env, nextObj, numOfIndentation, isFirstRun);
}

function arrayVarDec(env, obj){
    let val = '[', tmpVal, i = 0, length = obj.init.elements.length;
    while(i < length){
        tmpVal = getVal(env, obj.init.elements[i]);
        env = updateEnv(extendEnv(env, obj.id.name + '[' + i + ']', tmpVal));
        val += tmpVal + ((++i < length) ? ', ' : ']');
    }
    return extendEnv(env, obj.id.name, val);
}

function regVarDec(env, obj){
    return updateEnv(extendEnv(env, obj.id.name, obj.init === null ? null : getVal(env, obj.init)));
}

function varDec(env, obj){
    for(let i = 0; i < obj.declarations.length; ++i){
        let nextObj = obj.declarations[i], init = nextObj.init;
        env = (init === null || init.type !== 'ArrayExpression') ? regVarDec(env, nextObj) : arrayVarDec(env, nextObj);
    }
    return env;
}

function funcDec(env, obj, numOfIndentation, valArgs, isFirstRun) {
    let funcString = '';
    funcString += (doIndentation(numOfIndentation) + 'function ' + obj.id.name + ' (');
    let i = 0, length = obj.params.length;
    while(i < length)
        funcString += obj.params[i].name + ((++i < length) ? ', ' : ') {\n');
    handleArgs(obj.params, valArgs);
    isFirstRun ? env = env.concat(paramEnv) : addToCode(funcString, 'white');
    env = objMap(env, obj.body, numOfIndentation+1, isFirstRun);
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + '}\n', 'white');
    return env;
}

function returnStatement(env, obj, numOfIndentation, isFirstRun){
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + 'return ' + getVal(env, obj.argument) + ';\n', 'white');
    return updateEnv(env);
}

function writeAssExp(env, vr, vl, isSeq, isFirstRun){
    if(!needToDeleteExp(vr) && !isFirstRun)
        addToCode(isSeq ? (vr + ' = ' + vl + ', ') : (vr + ' = ' + vl +';\n'), 'white');
    return env;
}

function writeUpExp(env, vr, op, isSeq, isFirstRun){
    if(!needToDeleteExp(vr) && !isFirstRun)
        addToCode(isSeq ? (vr + op +', ') : (vr + op +';\n'), 'white');
    return env;
}

function updateExpression(env, obj, isSeq, isFirstRun){
    let op = obj.operator, vr = obj.argument.name, tmpVal =  getVal(env, obj.argument),
        vl = (typeof tmpVal === 'number') ? tmpVal+1 :
            getVal(env, obj.argument).toString().concat(op.charAt(0)).concat('1');
    return writeUpExp(updateEnv(extendEnv(env, vr, vl)), vr, op, isSeq, isFirstRun);
}

function needTODeleteArrExp(objName, val, isSeq, isFirstRun){
    if(!needToDeleteExp(objName + '[0]') && !isFirstRun)
        addToCode(isSeq ? (objName + ' = ' + val + ', ') : (objName + ' = ' + val +';\n'), 'white');
}

function arrayExpression(env, obj, objName , isSeq, isFirstRun){
    let rightObj = obj.right, length = rightObj.elements.length, val = '[', tmpVal, i = 0;
    while (i < length) {
        tmpVal = getVal(env, rightObj.elements[i]);
        env = updateEnv(extendEnv(env, objName + '[' + i + ']', tmpVal));
        val += tmpVal + ((++i < length) ? ', ' : ']');
    }
    needTODeleteArrExp(objName, val, isSeq, isFirstRun);
    return extendEnv(env, objName, val);
}

function regExpression(env, obj, objName, isSeq, isFirstRun){
    let val = getVal(env, obj.right);
    return writeAssExp(updateEnv(extendEnv(env, objName, val)), objName, val, isSeq, isFirstRun);
}

function handleMemberExpression(env, obj){
    let object = obj.object.name, property = getVal(env, obj.property);
    return  obj.computed ? object + '[' + property + ']' : object + '.' + property;
}

function assignmentExpression (env, obj, isSeq, isFirstRun) {
    let objName = (obj.left.type === 'MemberExpression') ? handleMemberExpression(env, obj.left) : obj.left.name;
    return obj.right.type === 'ArrayExpression' ? arrayExpression(env, obj, objName, isSeq, isFirstRun) :
        regExpression(env, obj, objName, isSeq, isFirstRun);
}

function handleExp(env, obj, isSeq, isFirstRun){
    return obj.type === 'AssignmentExpression' ? assignmentExpression(env, obj, isSeq, isFirstRun) :
        obj.type === 'UpdateExpression' ? updateExpression(env, obj, isSeq, isFirstRun) :
            objMap(env, obj, 0, isFirstRun);
}

function expressionStatement(env, exp, numOfIndentation, isFirstRun){
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation), 'white');
    return handleExp(env, exp.expression, false, isFirstRun);
}

function sequenceExpression(env, exp, numOfIndentation, isFirstRun){
    let i = 0, length = exp.expressions.length;
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation), 'white');
    while(i < length)
        env = handleExp(env, exp.expressions[i++], i < length, isFirstRun);
    return env;
}

function blockStatement(env, obj, numOfIndentation, isFirstRun){
    for(let i = 0; i < obj.body.length; ++i)
        env = objMap(env, obj.body[i], numOfIndentation, isFirstRun);
    return env;
}

function handleIfRuns(test, name, numOfIndentation, isFirstRun){
    if(isFirstRun)
        cond.push(test);
    else{
        addToCode(doIndentation(numOfIndentation) + name + ' (' +  test + ') {\n', cond[0] ? 'green' : 'red');
        cond.shift();
    }
}

function ifStructure(env, obj, numOfIndentation, name, isFirstRun) {
    let tEnv = makeEnv(env);
    handleIfRuns(getVal(tEnv, obj.test), name, numOfIndentation, isFirstRun);
    let alternate = obj.alternate;
    objMap(tEnv ,obj.consequent, numOfIndentation + 1, isFirstRun);
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + '}\n','white');
    if(alternate !== null)
        alternate.type === 'IfStatement' ? elseIfStatement(env, alternate, numOfIndentation, isFirstRun) :
            elseStatement(env, alternate, numOfIndentation, isFirstRun);
}

function ifStatement(env, obj, numOfIndentation, isFirstRun){
    ifStructure(env, obj, numOfIndentation, 'if', isFirstRun);
    return env;
}

function elseIfStatement(env, obj, numOfIndentation, isFirstRun) {
    ifStructure(env, obj, numOfIndentation, 'else if', isFirstRun);
}

function elseStatement (env, obj, numOfIndentation, isFirstRun){
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + 'else {\n', 'white');
    objMap(makeEnv(env), obj, numOfIndentation + 1, isFirstRun);
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + '}\n', 'white');
}

function whileStatement(env, obj, numOfIndentation, isFirstRun){
    let tEnv = makeEnv(env), test = getVal(tEnv, obj.test);
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + 'while (' + test + ') {\n', 'white');
    objMap(tEnv, obj.body, numOfIndentation + 1, isFirstRun);
    if(!isFirstRun)
        addToCode(doIndentation(numOfIndentation) + '}\n', 'white');
    return env;
}

function getVal(env, obj){
    let handlers = { 'MemberExpression' : memberExpression, 'Literal' : literal, 'Identifier' : identifier,
        'UnaryExpression' : unaryExpression, 'BinaryExpression' : binaryExpression,
        'LogicalExpression' : logicalExpression, 'UpdateExpression' : updateExpressionForVal};
    return handlers[obj.type](env, obj);
}

function literal(env, exp){
    return exp.value;
}

function identifier(env, exp){
    let x = convertToVal(env, exp.name);
    return x;
}

function unaryExpression(env, exp){
    let v1 = getVal(env, exp.argument), op = exp.operator, val = op + v1;
    return typeof v1 === 'number' ? eval(val) : val;
}

function binaryExpression(env, exp){
    let valLeft = getVal(env, exp.left), valRight = getVal(env, exp.right), val = valLeft + exp.operator + valRight;
    return typeof valLeft === 'number' && typeof  valRight === 'number' ? eval(val) : val;
}

function logicalExpression(env, exp){
    return '(' + getVal(env, exp.left) + exp.operator + getVal(env, exp.right) + ')';
}

function memberExpression(env, obj){
    let x =  convertToVal(env, handleMemberExpression(env, obj));
    return x;
}

function updateExpressionForVal(env, obj){
    let vr = getVal(env, obj.argument), vl = vr + obj.operator.charAt(0) + '1';
    vl = typeof (vr) === 'number' ? eval(vl) : vl;
    tmpEnv = tmpEnv.concat({'var' : obj.argument.name, 'val' : vl});
    return obj.prefix ? vl : vr;
}

function needToDeleteExp(exp){
    for(let i = 0; i < paramEnv.length; ++i)
        if(exp.toString().includes(paramEnv[i].var))
            return false;
    return true;
}

function addToCode(str, type){
    code = code.concat({'str': str, 'color': type});
}