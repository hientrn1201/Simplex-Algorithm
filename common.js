function getURLParam(strParamName) {
    var strReturn = "";
    var strHref = window.location.href;
    if (strHref.indexOf("?") > -1) {
        var strQueryString = strHref.substr(strHref.indexOf("?"));
        var aQueryString = strQueryString.split("&");
        for (var iParam = 0; iParam < aQueryString.length; iParam++) {
            if (aQueryString[iParam].indexOf(strParamName + "=") > -1) {
                var aParam = aQueryString[iParam].split("=");
                strReturn = aParam[1];
                break;
            }
        }
    }
    return strReturn;
}

/**
 * turns all of the URL parameters into properties of an object.
 * URL params being: URL?name1=val1&name2=val2 etc
 */
function makeUrlParams() {
    var strHref = window.location.href;
    var rtnObj = {};
    var paramsStart = strHref.indexOf("?");
    if (paramsStart > -1) {
        var strRemaining = strHref.substr(paramsStart + 1);
        while (strRemaining !== "") {
            var equalsStart = strRemaining.indexOf("=");
            // assert(equalsStart > -1);
            var paramName = strRemaining.substring(0, equalsStart);
            var amprStart = strRemaining.indexOf("&");
            if (amprStart === -1) {
                amprStart = strRemaining.length;
            }
            var paramVal = strRemaining.substring(equalsStart + 1, amprStart);
            rtnObj[paramName] = paramVal;
            strRemaining = strRemaining.substr(amprStart + 1);
        }
    }
    return rtnObj;
}

/**
 * Splits the String str with the specified seperator and casts to the either Number or Boolean (specified by Type).
 */
function splitAndCast(str, seperator, Type) {
    var rtnList = [];
    if (str.length > 0) {
        var list = str.split(seperator);
        var func;
        if (Type === Boolean) {
            func = function(data) { return data === "true"; };
        } else if (Type === Number) {
            func = function(data) { return parseInt(data, 10); };
        } else {
            return undefined;
        }
        for (var i = 0; i < list.length; i++) {
            rtnList[i] = func(list[i]);
        }
    }
    return rtnList;
}

/**
 * Creates an array with length specified by reps and with every item being data.
 */
function repeatToArray(data, reps) {
    var rtnArr = [];
    for (var i = 0; i < reps; i++) {
        rtnArr[i] = data;
    }
    return rtnArr;
}

function getBaseURL(url) {
   if (url.indexOf("?") != -1) {
      return url.substr(0,url.indexOf("?"));
   }
   return url;
}

function findPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    } else if (obj.x) {
        curleft += obj.x;
    }
    return curleft;
}

function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        }
    } else if (obj.y) {
        curtop += obj.y;
    }
    return curtop;
}

/*
function insertAfter(parent, node, referenceNode) {
  parent.insertBefore(node, referenceNode.nextSibling);
}
*/

/*
function printf(S, L) {
   var nS = "";
   for (var i = S.toString().length; i <= L; i++) {
      nS = nS + " ";
   }
   var returnVal = nS + S.toString();
   return nS + S;
}
*/

function getKey(e) {
   if (window.event) {
      return window.event.keyCode;
   } else if (e) {
      return e.keyCode;
   } else {
      return null;
   }
}

function getStyleByClassName(c,p) {
   for (var i = 0; i < document.styleSheets.length; i++) {
      for (var j = 0; j < document.styleSheets[i][cssRules].length; j++) {
         var t = document.styleSheets[i][cssRules][j].selectorText;
         if (t == c) {
            return document.styleSheets[i][cssRules][j].style[p];
         }
      }
   }
}

function deselectRadio(radioObj) {
   for (var i = 0; i < radioObj.length; i++) {
      radioObj[i].checked = false;
   }
}

/*
function nap (m) {var then = new Date(new Date().getTime() + m); while (new Date() < then) {}}
*/
/*
function cloneObject(what) {
   for (i in what) {
      this[i] = what[i];
   }
}
*/
/*
function clone(deep) {
    var objectClone = new this.constructor();
    for (var property in this)
        if (!deep)
        objectClone[property] = this[property];
    else if (typeof this[property] == 'object')
        objectClone[property] = this[property].clone(deep);
    else
        objectClone[property] = this[property];
    return objectClone;
}
*/

function setFocusOnInpt(inpt) {
    inpt.activate();
    inpt.focus();
    inpt.select();
}