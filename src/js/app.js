import $ from 'jquery';
import {parseCode, runManage, code} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        runManage(parsedCode);
        toPrint();
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});

function toPrint(){
    for(let i = 0; i < code.length; ++i) {
        let board = document.getElementById('codeText');
        let xx = document.createElement('div');
        xx.style.background = code[i].color;
        xx.appendChild(document.createTextNode(code[i].str));
        board.appendChild(xx);
    }
}