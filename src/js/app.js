import $ from 'jquery';
import {parseCode, runManage, cfg} from './code-analyzer';
import * as flowchart from 'flowchart.js';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        runManage(parsedCode);
        console.log(JSON.stringify(cfg));
        // setCfg();
        let code = generateChartLang();
        console.log(code);
        makeFlowDiagram(code);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});


function addToCfg(color, type, textCode, pointsTo, arrowType){
    cfg = cfg.concat({'color' : color, 'type' : type, 'textCode' : textCode, 'pointsTo' : pointsTo,
        'arrowType' : arrowType});
}

function setCfg(){
    cfg = [];
    addToCfg('green', 1, 'a = x + 1;\n' +
        'b = a + y;\n' +
        'c = 0;\n', [1, 496351], [2, 0]);
    addToCfg('green', 0, 'b < z', [2,3], [1, 0]);
    addToCfg('white', 1, ' c = c + z + 5;', [3,496351], [2, 2]);
    addToCfg('green', 2, '', [4,496351], [2,2]);
    addToCfg('green', 1, ' c = 5;', [496351,496351], [2, 2]);
}



function declarationType0(counter, i){
    return 'ob' + i + '=>condition: ' + '-' + counter + '-\n' + cfg[i].textCode +
        (cfg[i].color === 'green' ? '|TorFGreen' : '|TorFWhite')+ '\n';
}

function declarationType1(counter, i){
    return 'ob' + i + '=>operation: ' + '-' + counter + '-\n' + cfg[i].textCode + (cfg[i].color === 'green' ?
        '|greenComponent' : '') + '\n';
}

function declarationType2(i){
    return 'ob' + i + '=>start: ____' + (cfg[i].color === 'green' ? '|TorFGreen' : '|TorFWhite')+ '\n';
}

function handleDeclaration(){
    let code = '';
    let counter = 1;
    for (let i=0; i<cfg.length ;i++){
        code += (cfg[i].type === 0) ?  declarationType0(counter++, i) :  (cfg[i].type === 1) ?
            declarationType1(counter++, i) : declarationType2(i);
    }
    return code;
}

function arrowsType1Or2(ind){
    let code = '';
    if(cfg[ind].pointsTo[0] !== 496351)
        code += 'ob'+ind + '->' + 'ob'+cfg[ind].pointsTo[0] + '\n';
    if(cfg[ind].pointsTo[1] !== 496351)
        code += 'ob'+ind + '->' + 'ob'+cfg[ind].pointsTo[1] + '\n';
    return code;
}

function arrowsType0(ind){
    return 'ob' + ind + '(yes' + (cfg[ind].pointsTo[0].color === 'green' ? ',right' : '') + ')->ob'
        + cfg[ind].pointsTo[0] + '\n' + 'ob' + ind + '(no)->ob' + cfg[ind].pointsTo[1] + '\n';
}

function handleArrows(){
    let code = '';
    for (let i = 0; i<cfg.length ; ++i)
        code += (cfg[i].type === 1 || cfg[i].type === 2) ? arrowsType1Or2(i) : arrowsType0(i);
    return code;
}

function generateChartLang(){
    return handleDeclaration() + handleArrows();
}

function makeFlowDiagram(code){
    let diagram = flowchart.parse(code);
    diagram.drawSVG('diagram');
    // you can also try to pass options:
    diagram.drawSVG('diagram', {'x': 0, 'y': 0, 'line-width': 3, 'line-length': 50, 'text-margin': 10, 'font-size': 14,
        'font-color': 'black', 'line-color': 'black', 'element-color': 'black', 'fill': 'white', 'yes-text': 'yes',
        'no-text': 'no', 'arrow-end': 'block', 'scale': 1,
        // style symbol types

        // even flowstate support ;-)
        'flowstate' : { 'TorFGreen' : { 'fill' : '#0ec417', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
            'TorFWhite' : { 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
            'greenComponent' : { 'fill' : '#0ec417'}}});
}
