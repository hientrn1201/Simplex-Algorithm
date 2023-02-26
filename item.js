/**
 * Class Item - contains a tableau, a table, a div
 */
function Item(params) {
    activeItem = this; // TODO: redundant sometimes
    var i;
    if (params.constructor === Item) {
        // clone Item
        this.tableau = [];
        for (i = 0; i < params.tableau.length; i++) {
            this.tableau[i] = [];
            for (var j = 0; j < params.tableau[i].length; j++) {
                this.tableau[i][j] = params.tableau[i][j];
            }
        }
        this.type = params.type;
        this.num = params.num + 1;
        this.basicVar = this.toValidBasicVar(params.basicVar);
        this.freeVars = [];
        for (i = 0; i < params.freeVars.length; i++) {
            this.freeVars[i] = params.freeVars[i];
        }
        this.colLines = [];
        for (i = 0; i < params.colLines.length; i++) {
            this.colLines[i] = params.colLines[i];
        }
        this.rowLines = [];
        for (i = 0; i < params.rowLines.length; i++) {
            this.rowLines[i] = params.rowLines[i];
        }
        this.equalRows = [];
        for (i = 0; i < params.equalRows.length; i++) {
            this.equalRows[i] = params.equalRows[i]; 
        }
    } else {
        // parse string params
        var rowCount = (params.numRows !== undefined ? params.numRows : 1);
        var colCount = (params.numCols !== undefined ? params.numCols : 1);

        // [[String]:numCols]:numRows. Strings holding numbers or "".
        this.tableau = (params.tableau !== undefined ?
            parse_tableau(rowCount, colCount, params.tableau) :
            [[""]]);

        // String. one of "LOP", "System"
        this.type = (params.type !== undefined ? params.type : "LOP");

        // Number. the item number down the page of visible steps
        this.num = (params.num !== undefined ? parseInt(params.num, 10) : 0);

        // Number. ??? something with pivoting??
        this.basicVar = this.toValidBasicVar(params.basicVar);

        // [Number]:numCols. 0=not free, 1=free not in basis, 2=free and in basis
        this.freeVars = (params.freeVars !== undefined ?
            splitAndCast(params.freeVars, ",", Number) :
            repeatToArray(0, this.tableau[0].length));

        // [Number]:numRows. 0=not free, 1=free not in basis, 2=free and in basis
        this.equalRows = (params.equalRows !== undefined ?
            splitAndCast(params.equalRows, ",", Number) :
            repeatToArray(0, this.tableau.length));

        // [Boolean]:numCols. false=noline, true=line
        this.colLines = (params.colLines !== undefined ?
            splitAndCast(params.colLines, ",", Boolean) :
            repeatToArray(false, this.tableau[0].length));

        // [Boolean]:numRows. false=noline, true=line
        this.rowLines = (params.rowLines !== undefined ?
            splitAndCast(params.rowLines, ",", Boolean) :
            repeatToArray(false, this.tableau.length));

    }

    // init DOM objects
    this.createTb();
    this.createTable().appendChild(this.tb);
    this.div = document.createElement("div");
    this.div.appendChild(document.createElement("div"));
    this.div.appendChild(document.createElement("br"));
    this.div.appendChild(document.createElement("br"));
    this.div.appendChild(this.table);

    this.refreshLines();
}

/** 
 * Takes any input (including undefined) and returns a positive 
 * integer. Converts/casts/rounds arg or returns 1 if all else fails.
 */
Item.prototype.toValidBasicVar = function(arg) {
    if (arg !== undefined) {
        if (arg.constructor === Number) {
            return Math.floor(Math.abs(arg));
        }
        if (arg.constructor === String) {
            var rtnFromStr = parseInt(arg, 10);
            return (isNaN(rtnFromStr) ? 1 : Math.abs(rtnFromStr));
        }
    }
    return 1;
};

/**
 * Writes the tableau values from this.tableau into this.tb.
 */
Item.prototype.updateTb = function() {
    var tbNodes = this.tb.childNodes;
    for (var tabRow = 0; tabRow < tbNodes.length / 2; tabRow++) {
        var trNodes = tbNodes[tabRow * 2 + 1].childNodes;
        for (var tabCol = 0; tabCol < trNodes.length / 2; tabCol++) {
            trNodes[tabCol * 2 + 1].firstChild.value = this.tableau[tabRow][tabCol];
        }
    }
};

/**
 * Reads the tableau values from this.tb into this.tableau.
 */
Item.prototype.updateTableau = function() {
    this.tableau = [];
    var tbNodes = this.tb.childNodes;
    for (var i = 0; i < tbNodes.length / 2; i++) {
        this.tableau[i] = [];
        var trNodes = tbNodes[i * 2 + 1].childNodes;
        for (var j = 0; j < (trNodes.length - 1) / 2; j++) {
            var inpt = trNodes[j * 2 + 1].firstChild;
            this.tableau[i][j] = parseInt(inpt.value, 10);
        }
    }
};

Item.prototype.createTable = function() {
    this.table = document.createElement("table");
    this.table.setAttribute("class", "table");
    this.table.setAttribute("className", "table");
    this.table.setAttribute("cellspacing", 0);
    return this.table;
};

Item.prototype.createTb = function() {
    this.tb = document.createElement("tbody");

    var tr;
    var iRow, iCol;


    // first row
    tr = this.tb.insertRow(0);
    // tableauBtn
    var td = tr.insertCell(0);
    var btn = this.newButton("tableau");
    td.appendChild(btn);
    // rest of first row
    for (iCol = 1; iCol < this.tableau[0].length * 2; iCol++) {
        if (iCol % 2 === 1) {
            // columnBtn
            tr.insertCell(iCol).appendChild(this.newButton("column"));
            var freeVarVal = this.freeVars[(iCol - 1) / 2];
            if (freeVarVal !== 0) {
                this.setFreeVar(iCol, freeVarVal);
            }
        } else {
            // colLineBtn
            tr.insertCell(iCol).appendChild(this.newLineButton("col", this, this.colLines[iCol / 2 - 1]));
        }
    }
    // rest of rows
    for (iRow = 1; iRow < this.tableau.length * 2; iRow++) {
        tr = this.tb.insertRow(iRow);
        if (iRow % 2 === 1) {
            // rowBtn
            tr.insertCell(0).appendChild(this.newButton("row"));
            var equalRowVal = this.equalRows[(iRow - 1) / 2];
            if (equalRowVal !== 0) {
                this.setEqualRow(iRow, equalRowVal);
            }
            for (iCol = 1; iCol < this.tableau[0].length * 2; iCol++) {
                if (iCol % 2 === 1) {
                    // inpt
                    var rd = tr.insertCell(iCol);
                    rd.appendChild(this.newInput(""));
                    rd.setAttribute("align", "center");
                } else {
                    // colLine
                    tr.insertCell(iCol).appendChild(this.newLine("col"));
                }
            }
        } else {
            // rowLineBtn
            tr.insertCell(tr.cells.length).appendChild(this.newLineButton("row", this, this.rowLines[iRow / 2 - 1]));
            for (iCol = 1; iCol < this.tableau[0].length * 2; iCol++) {
                if (iCol % 2 === 1) {
                    // rowLine
                    tr.insertCell(iCol).appendChild(this.newLine("row"));
                } else {
                    // colLine rowLine
                    tr.insertCell(iCol).appendChild(this.newLine("colLine row"));
                }
            }
        }
    }
    this.updateTb();
    this.refreshFromTb();
};

// TODO: move out of Item
Item.prototype.newLineButton = function(type, item, activated) {
    var d = document.createElement("div");
    d.type = type; // "col" or "row"
    d.num = null;
    d.item = item;
    d.activated = activated;
    d.className = type + "LineBtn";
    d.onclick = function() {
        activeItem = this.item;
        var lines = this.item[type + "Lines"]; // this.rowLines or this.colLinds
        lines[this.num] = !lines[this.num];
        this.item.refreshLines();
        //        this.activated = !this.activated;
        //        if (this.type == "col") {
        //            this.item.colLines[this.num] = (!this.item.colLines[this.num]);
        //        } else {
        //            this.item.rowLines[this.num] = (!this.item.rowLines[this.num]);
        //        }
        //        updateLines(this.type, this.num);
    };
    return d;
};

// TODO: move out of Item
Item.prototype.newLine = function(type) {
    var d = document.createElement("div");
    d.className = type + "Line";
    return d;
};

// TODO: move out of Item
// TODO: return a div, don't append it to td. remove td parameter
Item.prototype.newButton = function(kind) {
    var div = document.createElement("div");
    div.setAttribute("class", kind + "Btn");
    div.setAttribute("className", kind + "Btn");
    div.row = null;
    div.col = null;
    div.kind = kind;
    div.item = this;
    div.highlighted = false;

    if (kind === "tableau") {
        div.innerHTML = "T&nbsp;" + this.num;
    } else {
        div.innerHTML = "&nbsp;";
    }

    div.onclick = function() {
        activeItem = this.item;
        if (kind == "tableau") {
        } else if (kind == "column") {
            activeColumn = this.col * 2 + 1;
        } else if (kind == "row") {
            activeRow = this.row * 2 + 1;
        }
    };

    div.onrightclick = function() {
        activeItem = this.item;
        activeColumn = this.col * 2 + 1;
        activeRow = this.row * 2 + 1;
    };

    div.oncontextmenu = showmenu;

    return div;
};

// TODO: move out of Item
Item.prototype.newInput = function(value) {
    var inpt = document.createElement("input");
    // TODO: is setAttribute necessary, or can we just .member = ?
    inpt.setAttribute("type", "text");
    inpt.setAttribute("value", value);
    inpt.setAttribute("class", "inpt");
    inpt.setAttribute("className", "inpt");
    inpt.setAttribute("tabindex", 0);
    inpt.setAttribute("autocomplete", "off");
    inpt.row = null;
    inpt.col = null;
    inpt.kind = "entry";
    inpt.item = this;
    inpt.highlighted = false;

    inpt.onclick = function(e) {
        this.activate();
    };

    inpt.onfocus = function(e) {
        this.activate();
    };

    inpt.onblur = function(e) {
        this.deactivate();
    };

    inpt.onchange = function() {
        activeItem.tableau[this.row][this.col] = this.value;
    };

    inpt.ondblclick = function(e) {
        activeItem = this.item;
        activeRow = this.row * 2 + 1;
        activeColumn = this.col * 2 + 1;
        pivotEntry();
        this.deactivate();
    };

    inpt.highlight = function() {
        this.style.backgroundColor = "#ffdd99";
        this.style.fontWeight = "bold";
    };

    inpt.unhighlight = function() {
        this.style.backgroundColor = "#ffffff";
        this.style.fontWeight = "normal";
    };

    inpt.activate = function() {
        activeItem = this.item;
        this.style.borderColor = "#000000";
        this.select();
        // TODO: scroll this element into view (but don't force it to be at the top or bottom of the page).
    };

    inpt.deactivate = function() {
        this.style.borderColor = "#ffffff";
    };

    inpt.oncontextmenu = showmenu;

    inpt.onkeydown = function(e) {
        activeItem = this.item;
        var key = getKey(e);
        var dr = 0, dc = 0; // change in selected row, col
        var tabbing = 0; // direction of tabbing (-1 = shift+tab)
        switch (key) {
            case 9: // tab
                tabbing = (e.shiftKey ? -1 : 1);
                dc = tabbing;
                break;
            case 37: // left
                dc = -1;
                break;
            case 38: // up
                dr = -1;
                break;
            case 39: // right
                dc = 1;
                break;
            case 40: // down
                dr = 1;
                break;
            default:
                return true;
        }
        var totalRows = activeItem.tableau.length;
        var totalCols = activeItem.tableau[0].length;
        var newC = (this.col + dc + totalCols) % totalCols;
        if (tabbing === 1 && newC === 0) {
            dr = 1;
        } else if (tabbing === -1 && newC === totalCols - 1) {
            dr = -1;
        }
        var newR = (this.row + dr + totalRows) % totalRows;
        activeItem.tb.childNodes[newR * 2 + 1].childNodes[newC * 2 + 1].firstChild.activate();
        return false;
    };

    inpt.onkeypress = function(e) {
        var key = getKey(e);
        if ((key >= 37) && (key <= 40)) {
            return false;
        }
    };
    inpt.onkeyup = function(e) {
        var key = getKey(e);
        if ((key >= 37) && (key <= 40)) {
            return false;
        }
    };

    return inpt;
};

/**
 * Highlights or lowlights a set of cells.
 * scope should be one of "tableau", "row", "col", "inpt".
 * row and col should contain DOM indexes as they are needed.
 * value should be one of true, false, "toggle".
 */
Item.prototype.setHighlight = function(scope, row, col, value) {
    var tbNodes = this.tb.childNodes;
    switch (scope) {
        case "tableau":
            var tableauBtn = tbNodes[0].childNodes[0].firstChild;
            tableauBtn.highlighted = (value !== "toggle" ? value : !tableauBtn.highlighted);
            break;
        case "row":
            var rowBtn = tbNodes[row].childNodes[0].firstChild;
            rowBtn.highlighted = (value !== "toggle" ? value : !rowBtn.highlighted);
            break;
        case "col":
            var columnBtn = tbNodes[0].childNodes[col].firstChild;
            columnBtn.highlighted = (value !== "toggle" ? value : !columnBtn.highlighted);
            break;
        case "inpt":
            var inpt = tbNodes[row].childNodes[col].firstChild;
            inpt.highlighted = (value !== "toggle" ? value : !inpt.highlighted);
            break;
    }
    this.refreshHighlights();
};

/**
 * Sets this.equalRows[(row - 1) / 2] and updates the html accordingly.
 * row should be the DOM index of the row.
 * value should be one of true, false, "toggle".
 */
Item.prototype.setEqualRow = function(row, value) {
    var tabRow = (row - 1) / 2;
    if (value === "toggle") {
        value = (this.equalRows[tabRow] === 0 ? 1 : 0);
    }
    this.equalRows[tabRow] = value;
    var rowBtn = this.tb.childNodes[row].childNodes[0].firstChild;
    switch (value) {
        case 0:
            rowBtn.innerHTML = "&nbsp;";
            break;
        case 1:
            rowBtn.innerHTML = "E";
            rowBtn.className = "red rowBtn";
            break;
        case 2:
            rowBtn.innerHTML = "E";
            rowBtn.className = "green rowBtn";
            break;
    }
};

/**
 * Sets this.freeVars[(col - 1) / 2] and updates the html accordingly.
 * col should be the DOM index of the column.
 * value should be one of true, false, "toggle".
 */
Item.prototype.setFreeVar = function(col, value) {
    var tabCol = (col - 1) / 2;
    if (value === "toggle") {
        value = (this.freeVars[tabCol] === 0 ? 1 : 0);
    }
    this.freeVars[tabCol] = value;
    var columnBtn = this.tb.childNodes[0].childNodes[col].firstChild;
    switch (value) {
        case 0:
            columnBtn.innerHTML = "&nbsp;";
            break;
        case 1:
            columnBtn.innerHTML = "F";
            columnBtn.className = "red columnBtn";
            break;
        case 2:
            columnBtn.innerHTML = "F";
            columnBtn.className = "green columnBtn";
            break;
    }
};

Item.prototype.insertColumn = function(index) {
    var tbNodes = this.tb.childNodes;
    // columnBtn
    tbNodes[0].insertCell(index).appendChild(this.newButton("column"));

    // inpt and rowLine
    for (var iRow = 1; iRow < this.tb.childNodes.length; iRow++) {
        var tr = tbNodes[iRow];
        if (iRow % 2 === 1) {
            tr.insertCell(index).appendChild(this.newInput("0"));
        } else {
            tr.insertCell(index).appendChild(this.newLine("row"));
        }
    }
};

Item.prototype.insertColumnLine = function(index) {
    var tbNodes = this.tb.childNodes;
    // colLineBtn
    tbNodes[0].insertCell(index).appendChild(this.newLineButton("col", this));
    for (var iRow = 1; iRow < tbNodes.length; iRow++) {
        var tr = tbNodes[iRow];
        if (iRow % 2 === 1) {
            // colLine
            tr.insertCell(index).appendChild(this.newLine("col"));
        } else {
            // colLine rowLine
            tr.insertCell(index).appendChild(this.newLine("colLine row"));
        }
    }
};

Item.prototype.addColumnBefore = function(index) {
    this.insertColumnLine(index);
    this.insertColumn(index);

    this.refreshFromTb();
};

Item.prototype.addColumnAfter = function(index) {
    this.insertColumn(index + 1);
    this.insertColumnLine(index + 1);

    this.refreshFromTb();
};

/**
 * Deletes the column at the given index (index must be the index of a columnBtn in this.tb.childNodes[0]).
 * Also deletes the column line to the left of the column. 
 * If index is of the first column, the line to the right is deleted.
 */
Item.prototype.deleteColumn = function(index) {
    if (index !== 1 && // if we're not deleting the first column,
            (index === this.colLines.length * 2 + 1 || // and we're deleting the last column
             !this.colLines[(index - 3) / 2])) { // or the line to the left is inactive,
        index--; // delete line to the left.
    }
    var tbNodes = this.tb.childNodes;
    for (var iRow = 0; iRow < tbNodes.length; iRow++) {
        var tr = tbNodes[iRow];
        tr.removeChild(tr.childNodes[index]); // delete column then line,
        tr.removeChild(tr.childNodes[index]); // or line then column
    }
    this.refreshFromTb();
};

// TODO: JSLint (http://www.jslint.com/)
Item.prototype.insertRow = function(index) {
    var tr = this.tb.insertRow(index);
    // rowBtn
    tr.insertCell(0).appendChild(this.newButton("row"));
    var tableWidth = this.tb.childNodes[0].childNodes.length;
    for (var iCol = 1; iCol < tableWidth; iCol++) {
        if (iCol % 2 === 1) {
            // inpt
            tr.insertCell(iCol).appendChild(this.newInput("0"));
        } else {
            // colLine
            tr.insertCell(iCol).appendChild(this.newLine("col"));
        }
    }
};

// TODO: JSLint (http://www.jslint.com/)
Item.prototype.insertRowLine = function(index) {
    var tr = this.tb.insertRow(index);
    // rowLineButton
    tr.insertCell(0).appendChild(this.newLineButton("row", this));
    var tableWidth = this.tb.childNodes[0].childNodes.length;
    for (var iCol = 1; iCol < tableWidth; iCol++) {
        if (iCol % 2 === 1) {
            // rowLine
            tr.insertCell(iCol).appendChild(this.newLine("row"));
        } else {
            // colLine rowLine
            tr.insertCell(iCol).appendChild(this.newLine("colLine row"));
        }
    }
};

Item.prototype.addRowBefore = function(index) {
    this.insertRowLine(index);
    this.insertRow(index);

    this.refreshFromTb();
};

Item.prototype.addRowAfter = function(index) {
    this.insertRow(index + 1);
    this.insertRowLine(index + 1);

    this.refreshFromTb();
};

Item.prototype.deleteRow = function(index) {
    if (index !== 1 && // if we're not deleting the first row,
            (index === this.rowLines.length * 2 + 1 || // and we're deleting the last row
             !this.rowLines[(index - 3) / 2])) { // or the line above is inactive,
        index--; // delete line above.
    }
    this.tb.removeChild(this.tb.childNodes[index]); // delete row then line,
    this.tb.removeChild(this.tb.childNodes[index]); // or line then row.

    this.refreshFromTb();
};

Item.prototype.pivot = function(rowIndex, colIndex) {
    var row = (rowIndex - 1) / 2;
    var col = (colIndex - 1) / 2;
    var i, j;

    if (this.equalRows[row] === 1) {
        this.setEqualRow(rowIndex, 2);
    }
    if (this.freeVars[col] === 1) {
        this.setFreeVar(colIndex, 2);
    }

    if (this.tableau[row][col] < 0) {
        // pivot val is negative. flip the sign of the row with the pivot val in it.
        for (j = 0; j < this.tableau[row].length; j++) {
            this.tableau[row][j] *= -1;
        }
    }

    for (i = 0; i < this.tableau.length; i++) {
        if (i !== row) { // skip pivot row
            var pivotRowVal = this.tableau[i][col];
            for (j = 0; j < this.tableau[i].length; j++) {
                this.tableau[i][j] = (this.tableau[row][col] * this.tableau[i][j] - pivotRowVal * this.tableau[row][j]) / this.basicVar;
            }
        }
    }

    this.basicVar = this.tableau[row][col];
};

/**
 * Scans through this.tb and sets the following members:
 *   with (this) { .tableau, .rowLines, .colLines, .freeVars, .equalRows };
 *   with (colLineBtn, rowLineBtn) { .num };
 *   with (columnBtn, inpt) { .col };
 *   with (rowBtn, inpt) { .row };
 * This method is inteded to be called after adding/deleting rows/cols.
 * Simply alter the html DOM and this method will adjust the corresponding
 * javascript fields accordingly.
 */
Item.prototype.refreshFromTb = function() {
    var iRow, iCol; // int iterators for row and col corresponding to the childNodes[] index
    var tabRow, tabCol; // int indexes in the tableau. always = floor((iRow-1)/2), floor((iCol-1)/2)
    var tbNodes = this.tb.childNodes;
    var firstRowNodes = tbNodes[0].childNodes;

    // clear all this array fields so they won't be too long
    this.tableau = [];
    this.rowLines = [];
    this.colLines = [];
    this.freeVars = [];
    this.equalRows = [];

    /* (nothing to do with tableauBtn) */

    // rest of col headers
    for (iCol = 1; iCol < firstRowNodes.length; iCol++) {
        if ((iCol % 2) === 1) {
            // columnBtn
            var columnBtn = firstRowNodes[iCol].firstChild;
            tabCol = (iCol - 1) / 2;
            columnBtn.col = tabCol;
            if (columnBtn.innerHTML !== "F") {
                this.freeVars[tabCol] = 0;
            } else if (columnBtn.className === "red columnBtn") {
                this.freeVars[tabCol] = 1;
            } else {
                this.freeVars[tabCol] = 2;
            }
        } else {
            // colLineBtn
            var colLineBtn = firstRowNodes[iCol].firstChild;
            tabCol = iCol / 2 - 1;
            colLineBtn.num = tabCol;
            this.colLines[tabCol] = colLineBtn.activated;
        }
    }

    // rest of rows
    for (iRow = 1; iRow < tbNodes.length; iRow++) {
        var trNodes = tbNodes[iRow].childNodes;
        if ((iRow % 2) === 0) {
            // rowLineBtn and rowLine
            tabRow = iRow / 2 - 1;
            // rowLineBtn
            var rowLineBtn = trNodes[0].firstChild;
            rowLineBtn.num = tabRow;
            this.rowLines[tabRow] = rowLineBtn.activated;

            /* (nothing to do with rowLine or the intersection of lines) */

        } else {
            // rowBtn and inpt
            tabRow = (iRow - 1) / 2;
            // rowBtn
            var rowBtn = trNodes[0].firstChild;
            rowBtn.row = tabRow;
            if (rowBtn.innerHTML !== "E") {
                this.equalRows[tabRow] = 0;
            } else if (rowBtn.className === "red rowBtn") {
                this.equalRows[tabRow] = 1;
            } else {
                this.equalRows[tabRow] = 2;
            }
            // rest of row
            this.tableau[tabRow] = [];
            for (iCol = 1; iCol < trNodes.length; iCol += 2) { // skip colLine
                tabCol = (iCol - 1) / 2;
                // inpt
                var inpt = trNodes[iCol].firstChild;
                inpt.row = tabRow;
                inpt.col = tabCol;
                this.tableau[tabRow][tabCol] = parseInt(inpt.value, 10);
            }
        }
    }
    this.refreshLines();
    this.refreshHighlights();
};

/**
 * Reads { this.[row/col]Lines }
 * sets { [row/col]LineBtn.activated, with ([col/row]Line, "colLine rowLine") { .style.backgroundColor }}
 */
Item.prototype.refreshLines = function() {
    var activeLineColor = "#000000";
    var inactiveLineColor = "#ffffff";
    var iRow, iCol; // int iterators for row and col corresponding to the childNodes[] index
    var tabRow, tabCol; // int indexes in the tableau. always = floor((iRow-1)/2), floor((iCol-1)/2)
    var tbNodes = this.tb.childNodes;

    // colLineBtn
    var firstRowNodes = tbNodes[0].childNodes;
    for (iCol = 2; iCol < firstRowNodes.length; iCol += 2) {
        firstRowNodes[iCol].firstChild.activated = this.colLines[iCol / 2 - 1];
    }
    for (iRow = 1; iRow < tbNodes.length; iRow++) {
        var trNodes = tbNodes[iRow].childNodes;
        if ((iRow % 2) === 0) {
            // row line
            var rowActivated = this.rowLines[iRow / 2 - 1];
            var rowColor = (rowActivated ? activeLineColor : inactiveLineColor);
            // rowLineBtn
            trNodes[0].firstChild.activated = rowActivated;
            for (iCol = 1; iCol < trNodes.length; iCol++) {
                if ((iCol % 2) === 1) {
                    // rowLine
                    trNodes[iCol].firstChild.style.backgroundColor = rowColor;
                } else {
                    // colLine rowLine
                    var clrlColor = ((rowActivated || this.colLines[iCol / 2 - 1]) ? activeLineColor : inactiveLineColor);
                    trNodes[iCol].firstChild.style.backgroundColor = clrlColor;
                }
            }
        } else {
            // colLine
            for (iCol = 2; iCol < trNodes.length; iCol += 2) {
                var colColor = (this.colLines[iCol / 2 - 1] ? activeLineColor : inactiveLineColor);
                trNodes[iCol].firstChild.style.backgroundColor = colColor;
            }
        }
    }
};

/**
 * Reads .highlighted from (tableauBtn, columnBtn, rowBtn, inpt)
 * Sets inpt.style {.backgroundColor, .fontWeight}
 */
Item.prototype.refreshHighlights = function() {
    var tbNodes = this.tb.childNodes;
    var tabHigh = tbNodes[0].childNodes[0].firstChild.highlighted;
    for (var iRow = 1; iRow < tbNodes.length; iRow += 2) {
        var trNodes = tbNodes[iRow].childNodes;
        var rowHigh = tabHigh || trNodes[0].firstChild.highlighted;
        for (var iCol = 1; iCol < trNodes.length; iCol += 2) {
            var colHigh = tbNodes[0].childNodes[iCol].firstChild.highlighted;
            var inpt = trNodes[iCol].firstChild;
            var inptHigh = rowHigh || (colHigh || inpt.highlighted);
            inpt.style.backgroundColor = (inptHigh ? "#ffdd99" : "#ffffff");
            inpt.style.fontWeight = (inptHigh ? "bold" : "normal");
        }
    }
}; 