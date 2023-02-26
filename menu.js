
var cssRules;
if (document.all) {
    cssRules = "rules";
} else if (document.getElementById) {
    cssRules = "cssRules";
}

function pivotEntry() {
    var mainDiv = document.getElementById("main");

    while (activeItem.div.nextSibling !== null) {
        mainDiv.removeChild(activeItem.div.nextSibling);
    }

    activeItem.tb.childNodes[activeRow].childNodes[activeColumn].firstChild.deactivate();

    activeItem.updateTableau();
    activeItem = new Item(activeItem);

    mainDiv.appendChild(activeItem.div);

    activeItem.pivot(activeRow, activeColumn);
    activeItem.updateTb();

    var piv = activeItem.div.childNodes[0];
    var r = (activeRow - 1) / 2 + 1;
    var c = (activeColumn - 1) / 2 + 1;
    piv.innerHTML = "Pivoted on row " + r + " column " + c;
    activeItem.div.insertBefore(piv, activeItem.table);

    scroll(0, findPosY(activeItem.div));
}

function highlightEntry() {
    activeItem.setHighlight("inpt", activeRow, activeColumn, "toggle");
}

function fillEntry(x) {
    var e = activeItem.tb.childNodes[activeRow].childNodes[activeColumn].childNodes[0];
    e.setAttribute("value", x);
}

function addRowAndColumnAfter() {
    activeItem.addColumnAfter(activeColumn);
    activeItem.addRowAfter(activeRow);
    setFocusOnInpt(activeItem.tb.childNodes[activeRow + 2].childNodes[activeColumn + 2].firstChild);
}

function deleteRowAndColumn() {
    activeItem.deleteRow(activeRow);
    activeItem.deleteColumn(activeColumn);
}

    /**************************/


function highlightColumn() {
    activeItem.setHighlight("col", null, activeColumn, "toggle");
//    var e = activeItem.tb.childNodes[0].childNodes[activeColumn].firstChild;
//    e.highlighted = (!e.highlighted);
//    updateColHighlight(activeColumn);
}

function deleteColumn() {
    activeItem.deleteColumn(activeColumn);
}

function addColumnAfter() {
    activeItem.addColumnAfter(activeColumn);
    activeColumn = activeColumn + 2;
    setFocusOnInpt(activeItem.tb.childNodes[1].childNodes[activeColumn].firstChild);
}

function addColumnBefore() {
    activeItem.addColumnBefore(activeColumn);
    setFocusOnInpt(activeItem.tb.childNodes[1].childNodes[activeColumn].firstChild);
}

function fillColumn(num) {
    for (var i = 1; i < activeItem.tb.childNodes.length; i++) {
        activeItem.tb.childNodes[i].childNodes[activeColumn].childNodes[0].value = num;
    }
}

function markAsFree() {
    activeItem.setFreeVar(activeColumn, "toggle");
}



    /**************************/


function highlightRow() {
    activeItem.setHighlight("row", activeRow, null, "toggle");
//    var e = activeItem.tb.childNodes[activeRow].childNodes[0].firstChild;
//    e.highlighted = (!e.highlighted);
//    updateRowHighlight(activeRow);
}

function deleteRow() {
    activeItem.deleteRow(activeRow);
}

function addRowAfter() {
    activeItem.addRowAfter(activeRow);
    activeRow = activeRow + 2;
    setFocusOnInpt(activeItem.tb.childNodes[activeRow].childNodes[1].firstChild);
}

function addRowBefore() {
    activeItem.addRowBefore(activeRow);
    setFocusOnInpt(activeItem.tb.childNodes[activeRow].childNodes[1].firstChild);
}

function fillRow(num) {
    for (var j = 1; j < activeItem.tb.childNodes[activeRow].childNodes.length; j++) {
        activeItem.tb.childNodes[activeRow].childNodes[j].childNodes[0].value = num;
    }
}

function markAsEquality() {
    activeItem.setEqualRow(activeRow, "toggle");
}


    /**********************/


function highlightTableau() {
    activeItem.setHighlight("tableau", null, null, "toggle");
}

function wider() {
    var w = getStyleByClassName(".inpt", "width");
    if (w == "34px") {
        setColWidth("60");
    } else if (w == "64px") {
        setColWidth("100");
    } else if (w == "104px") {
        setColWidth("150");
    }
}

function thinner() {
    var w = getStyleByClassName(".inpt", "width");
    if (w == "64px") {
        setColWidth("30");
    } else if (w == "104px") {
        setColWidth("60");
    } else if (w == "154px") {
        setColWidth("100");
    }
}

function fillTableau(num) {
    for (var i = 1; i < activeItem.tb.childNodes.length; i++) {
        for (var j = 1; j < activeItem.tb.childNodes[i].childNodes.length; j++) {
            activeItem.tb.childNodes[i].childNodes[j].childNodes[0].value = num;
        }
    }
}

function setColWidth(w) {
    for (var i = 0; i < document.styleSheets.length; i++) {
        for (var j = 0; j < document.styleSheets[i][cssRules].length; j++) {
            var t = document.styleSheets[i][cssRules][j].selectorText;
            if (t == ".inpt") {
                var w4 = parseInt(w, 10) + 4;
                document.styleSheets[i][cssRules][j].style.width = w4 + "px";
            } else if ((t == ".tableauBtn") || (t == ".rowBtn") || (t == ".columnBtn")) {
                document.styleSheets[i][cssRules][j].style.width = w + "px";
            }
        }
    }
}




    /**********************/



function promptSize() {
    var d = document.getElementById("sizePrompt");
    var left = findPosX(activeItem.table);
    var top = findPosY(activeItem.table);

    d.style.left = left + "px";
    d.style.top = top + "px";

    hideActiveTb();
    d.style.visibility = "visible";

    document.getElementById("eVariables").focus();
}

function promptValidate() {
    // TODO: clean up. reduce code duplication
    var vars = document.getElementById("eVariables").value;
    var cons = document.getElementById("eConstraints").value;
    // var form = document.getElementById("editform");
    var sign = "";                         // ( Inequalities | Equalities | Empty )
    var type = "";                         // ( LOP | System )

    for (var i = 0; i <= 2; i++) {
        if (document.editform.sign[i].checked === true) {
            sign = document.editform.sign[i].value;
        }
    }
    for (var j = 0; j <= 1; j++) {
        if (document.editform.type[j].checked === true) {
            type = document.editform.type[j].value;
        }
    }

    if (((vars !== "") && (cons !== "") && (sign !== "") && (type !== "")) || (sign === "Empty")) {
        fill_tableau(vars, cons, sign, type);
    }
}

function copyValidate() {
    // TODO: better variable names
    var t = document.getElementById("cTextarea").value;
    var r = document.getElementById("cRows").value;
    var c = document.getElementById("cColumns").value;
    var readBc = document.getElementById("readBc").checked;
    if ((t !== "") && (r !== "") && (c !== "")) {
        hideCopyPaste();
        hideSizePrompt();
        create_tableau(t, r, c, readBc);
    } else {
        // validation failed
    }
}

function choose_empty(v, c) {
    deselectRadio(document.forms.editform.elements.sign);
    deselectRadio(document.forms.editform.elements.type);
    v = parseInt(v, 10);
    c = parseInt(c, 10);
    copyPasteTableau(v, c);
}

function fill_tableau(vars, cons, sign, type) {
    document.getElementById("sizePrompt").style.visibility = "hidden";
    var v = parseInt(vars, 10);
    var c = parseInt(cons, 10);
    var tableau = [];
    var equalRows = [], freeVars = [];
    var rowLines = [], colLines = [];
    var i, j;

    if (type == "LOP") {
        if (sign == "Inequalities") {
            activeItem.num = -1;
            activeItem.div.parentNode.removeChild(activeItem.div);
            for (i = 0; i < c + 1; i++) {
                equalRows[i] = 0;
                tableau[i] = [];
                if (i < c) {
                    rowLines[i] = false;
                }
                for (j = 0; j < (v + c + 1) + 1; j++) {
                    freeVars[j] = 0;
                    if (j < (v + c + 1)) {
                        colLines[j] = false;
                    }
                    tableau[i][j] = "";
                    if ((j >= v) && (j <= v + c)) {
                        if (i == j - v) {
                            tableau[i][j] = 1;
                        } else {
                            tableau[i][j] = 0;
                        }
                    }
                }
            }
            rowLines[c - 1] = true;
            colLines[v - 1] = true;
            colLines[c + v] = true;
            tableau[c][v + c + 1] = 0;
            newTableau(tableau, type, equalRows, freeVars, rowLines, colLines);
        } else if (sign == "Equalities") {
            activeItem.num = -1;
            activeItem.div.parentNode.removeChild(activeItem.div);
            for (i = 0; i < c + 1; i++) {
                equalRows[i] = 1;
                tableau[i] = [];
                if (i < c) {
                    rowLines[i] = false;
                }
                for (j = 0; j < (v + 1) + 1; j++) {
                    freeVars[j] = 0;
                    tableau[i][j] = "";
                    if (j < v + 1) {
                        colLines[j] = false;
                    }
                    if (j == v) {
                        if (i == c) {
                            tableau[i][j] = 1;
                        } else {
                            tableau[i][j] = 0;
                        }
                    }
                }
            }
            rowLines[c - 1] = true;
            colLines[v - 1] = true;
            colLines[v] = true;
            equalRows[c] = 0;
            tableau[c][v + 1] = 0;
            newTableau(tableau, type, equalRows, freeVars, rowLines, colLines);
        }
    } else if (type == "System") {
        if (sign == "Inequalities") {
            activeItem.num = -1;
            activeItem.div.parentNode.removeChild(activeItem.div);
            for (i = 0; i < c; i++) {
                equalRows[i] = 0;
                tableau[i] = [];
                if (i < c - 1) {
                    rowLines[i] = false;
                }
                for (j = 0; j < v + c + 1; j++) {
                    freeVars[j] = 0;
                    tableau[i][j] = "";
                    if (j < (v + c + 1) - 1) {
                        colLines[j] = false;
                    }
                    if ((j >= v) && (j < v + c)) {
                        if (i == j - v) {
                            tableau[i][j] = 1;
                        } else {
                            tableau[i][j] = 0;
                        }
                    }
                }
            }
            colLines[v - 1] = true;
            colLines[v + c - 1] = true;
            newTableau(tableau, type, equalRows, freeVars, rowLines, colLines);
        } else if (sign == "Equalities") {
            activeItem.num = -1;
            activeItem.div.parentNode.removeChild(activeItem.div);
            for (i = 0; i < c; i++) {
                equalRows[i] = 1;
                tableau[i] = [];
                if (i < c - 1) {
                    rowLines[i] = false;
                }
                for (j = 0; j < v + 1; j++) {
                    freeVars[j] = 0;
                    tableau[i][j] = "";
                    if (j < (v + 1) - 1) {
                        colLines[j] = false;
                    }
                }
            }
            colLines[v - 1] = true;
            newTableau(tableau, type, equalRows, freeVars, rowLines, colLines);
        }
    }
}

// TODO: reorganize the tableau creation process
function create_tableau(t, r, c, readBc) {
    showActiveTb();
    var tableau = get_tableau(t, r, c);

    var m = document.getElementById("main");

    while (m.childNodes.length > 0) {
        m.removeChild(m.firstChild);
    }
    var basicCoef = 1;
    debugger;
    if (readBc) {
        var entries = tableau.split(",");
        var index = r * c - 2;
        if (index < entries.length) {
            basicCoef = parseInt(entries[index], 10);
            if (basicCoef === 0) {
                basicCoef = 1;
            }
        }
    }
    activeItem = new Item({ tableau: tableau, numRows: r, numCols: c, basicVar: basicCoef });
    m.appendChild(activeItem.div);

    scroll(0, 0);
}

function copyPasteTableau(v, c) {
    var str = "";
    for (var i = 0; i < activeItem.tableau.length; i++) {
        var val = activeItem.tableau[i][0];
        str += (isNaN(val) ? "" : val.toString()); // no tab before first col
        for (var j = 1; j < activeItem.tableau[i].length; j++) {
            val = activeItem.tableau[i][j];
            str += "\t" + (isNaN(val) ? "" : val.toString());
        }
        str += "\n";
    }

    document.getElementById("cTextarea").value = str;

    hideActiveTb();
    showCopyPaste();
}

function cancelCopyPaste() {
    document.getElementById("copyPaste").style.visibility = "hidden";
    document.getElementById("cTextarea").style.visibility = "hidden";
    showActiveTb();
}

// TODO: Better name. parseTableauFromUrl or something
// TODO: better argument names
function parse_tableau(r, c, d) {
    var data = d.split(",");
    var tableau = [];
    for (var i = 0; i < r; i++) {
        tableau[i] = [];
        for (var j = 0; j < c; j++) {
            var index = i * c + j;
            tableau[i][j] = (index < data.length && data[index] !== "" ? parseInt(data[index], 10) : "");
        }
    }
    return tableau;
}

// TODO: better name. makeUrlParamFromTextArea or something
// TODO: better argument names
// TODO: r and c are never used
function get_tableau(t, r, c) {
    t = t.replace(/^[^\d\-]+/g, ""); // delete leading noise
    var data = t.split(/[^\d\-]+/); // split on non-numbers
    return data.join(","); // join with ","
}

function copyTableauNewWindow() {
    var tableauData = activeItem.tableau[0].join(",");

    for (var i = 1; i < activeItem.tableau.length; i++) {
        tableauData += "," + activeItem.tableau[i].join(",");
    }
    window.open(getBaseURL(window.location.href) +
                "?title=" + title + chars[counter++] +
                "&tableau=" + tableauData +
                "&numRows=" + activeItem.tableau.length +
                "&numCols=" + activeItem.tableau[0].length +
                "&type=" + activeItem.type +
                "&basicVar=" + activeItem.basicVar +
                "&freeVars=" + activeItem.freeVars.join(",") +
                "&colLines=" + activeItem.colLines.join(",") +
                "&rowLines=" + activeItem.rowLines.join(",") +
                "&equalRows=" + activeItem.equalRows.join(",") +
                "");
}

function newTableauTabFormat() {
    window.open(getBaseURL(window.location.href) + "?title=" + title + chars[counter++]);
}

function newTableauPasteFormat() {
    window.open(getBaseURL(window.location.href) + "?type=copypaste&title=" + title + chars[counter++]);
}

function newTableau(tableau, type, equalRows, freeVars, rowLines, colLines) {
//    var w = 1;

    var m = document.getElementById("main");
    while (m.childNodes.length > 0) {
        m.removeChild(m.firstChild);
    }
    activeItem.num = -1;
    activeItem.tableau = tableau;
    activeItem.type = type;
    activeItem.equalRows = equalRows;
    activeItem.freeVars = freeVars;
    activeItem.rowLines = rowLines;
    activeItem.colLines = colLines;

    activeItem = new Item(activeItem);

    m.appendChild(activeItem.div);
    scroll(0, 0);
}

// TODO move to Item
function deactivateAll() {
    for (var i = 1; i < activeItem.tb.childNodes.length; i++) {
        for (var j = 1; j < activeItem.tb.childNodes[i].childNodes.length; j++) {
            activeItem.tb.childNodes[i].childNodes[j].childNodes[0].deactivate();
        }
    }
}

function convertToLaTeX() {
    var i, j;
    var tbNodes = activeItem.tb.childNodes;
    var latexStr = "\\left[\\begin{array}{"; // LaTeX header LaTeX
    // column headers/lines
    var trNodes = tbNodes[0].childNodes;
    for (j = 1; j < trNodes.length; j++) {
        if (j % 2 === 1) {
            latexStr += "r";
        } else {
            if (activeItem.colLines[j / 2 - 1]) {
                latexStr += "|";
            }
        }
    }
    latexStr += "}\n";
    for (i = 1; i < tbNodes.length; i++) {
        trNodes = tbNodes[i].childNodes;
        if (i % 2 === 1) {
            latexStr += trNodes[1].firstChild.value; // first cell in the fow
            // rest of cells in the row
            for (j = 3; j < trNodes.length; j += 2) {
                latexStr += "&" + trNodes[j].firstChild.value;
            }
            latexStr += "\\\\\n"; // end of row
        } else {
            if (activeItem.rowLines[i / 2 - 1]) {
                latexStr += "\\hline\n";
            }
        }
    }
    latexStr += "\\end{array}\\right]"; // LaTeX footer
    hideActiveTb();
    showInfoText();
    var infoTextarea = document.getElementById("infoTextarea");
    infoTextarea.value = latexStr;
}

function convertToMaple() {
    var t = activeItem.tableau;
    var mapleStr = "Matrix(" + t.length + "," + t[0].length + ",\n";

    // firstline
    mapleStr += "[ [" + t[0].join(",") + "],\n";

    // middle lines
    for (var i = 1; i < t.length - 1; i++) {
        mapleStr += "  [" + t[i].join(",") + "],\n";
    }

    // last line
    mapleStr += "  [" + t[t.length - 1].join(",") + "] ]);";

    hideActiveTb();
    showInfoText();
    document.getElementById("infoTextarea").value = mapleStr;
}

function showActiveTb() {
    activeItem.tb.style.visibility = "visible";
}

function hideActiveTb() {
    activeItem.tb.style.visibility = "hidden";
}

function wasEscPressed(e) {
    // MSIE or Firefox?
    var kC = (window.event) ? window.event.keyCode : e.keyCode;
    // MSIE : Firefox
    var Esc = (window.event) ? 27 : e.DOM_VK_ESCAPE;
    if (kC === Esc) {
        deactivateAll();
    }
}

