var getAllMatches = require("./util").getAllMatches;

var xmlNode = function(tagname,parent,val){
    this.tagname = tagname;
    this.parent = parent;
    this.child = [];
    this.val = val;
    this.addChild = function (child){
        this.child.push(child);
    };
};

//var tagsRegx = new RegExp("<(\\/?[a-zA-Z0-9_:]+)([^>\\/]*)(\\/?)>([^<]+)?","g");
//var tagsRegx = new RegExp("<(\\/?[\\w:-]+)([^>]*)>([^<]+)?","g");
var tagsRegx = new RegExp("<(\\/?[\\w:-]+)([^>]*)>(<!\\[CDATA\\[(.*)\\]\\]>)?([^<]+)?","g");

var defaultOptions = {
    attrPrefix : "@_",
    textNodeName : "#text",
    ignoreNonTextNodeAttr : true,
    ignoreTextNodeAttr : true,
    ignoreNameSpace : false,
    ignoreRootElement : false,
    textNodeConversion : true
};

var buildOptions = function (options){
    if(!options) options = {};
    var props = ["attrPrefix","ignoreNonTextNodeAttr","ignoreTextNodeAttr","ignoreNameSpace","ignoreRootElement","textNodeName","textNodeConversion"];
    for (var i = 0; i < props.length; i++) {
        if(options[props[i]] === undefined){
            options[props[i]] = defaultOptions[props[i]];
        }
    }
    return options;
};

var getTraversalObj =function (xmlData,options){
    options = buildOptions(options);
    //xmlData = xmlData.replace(/>(\s+)/g, ">");//Remove spaces and make it single line.
    var tags = getAllMatches(xmlData,tagsRegx);
    var xmlObj = new xmlNode('!xml');
    var currentNode = xmlObj;

    for (var i = 0; i < tags.length ; i++) {
        var tag = resolveNameSpace(tags[i][1],options.ignoreNameSpace),
            nexttag = i+1 < tags.length ? resolveNameSpace(tags[i+1][1],options.ignoreNameSpace) : undefined,
            attrsStr = tags[i][2], attrs,
            val = tags[i][4] ===  undefined ? tags[i][5] :  simplifyCDATA(tags[i][4]);

        if(tag.indexOf("/") === 0){//ending tag
            currentNode = currentNode.parent;
            continue;
        }

        var selfClosingTag = attrsStr.charAt(attrsStr.length-1) === '/';
        var childNode = new xmlNode(tag,currentNode);

        if(selfClosingTag){
            attrs = buildAttributesArr(attrsStr,options.ignoreTextNodeAttr,options.attrPrefix,options.ignoreNameSpace);
            childNode.val = attrs || "";
            currentNode.addChild(childNode);
        }else if( ("/" + tag) === nexttag){ //Text node
            attrs = buildAttributesArr(attrsStr,options.ignoreTextNodeAttr,options.attrPrefix,options.ignoreNameSpace);
            val = parseValue(val,options.textNodeConversion);
            if(attrs){
                attrs[options.textNodeName] = val;
                childNode.val = attrs;
            }else{
                childNode.val = val || "";
            }
            currentNode.addChild(childNode);
            i++;
        }else{//starting tag
            attrs = buildAttributesArr(attrsStr,options.ignoreNonTextNodeAttr,options.attrPrefix,options.ignoreNameSpace);
            if(attrs){
                for (var prop in attrs) {
                  attrs.hasOwnProperty(prop) && childNode.addChild(new xmlNode(prop,childNode,attrs[prop]));
                }
            }
            currentNode.addChild(childNode);
            currentNode = childNode;
        }
    }
    return xmlObj;
};

var xml2json = function (xmlData,options){
    return convertToJson(getTraversalObj(xmlData,options));
};

function simplifyCDATA(cdata){
    return cdata.replace(new RegExp("\\]\\]><\!\\[CDATA\\[", 'g'), "");
}

function resolveNameSpace(tagname,ignore){
    if(ignore){
        var tags = tagname.split(":");
        var prefix = tagname.charAt(0) === "/" ? "/" : "";
        if(tags.length === 2) {
            tagname = prefix + tags[1];
        }
    }
    return tagname;
}

function parseValue(val,conversion){
    if(val){
        if(!conversion || isNaN(val)){
            val = "" + val ;
        }else{
            if(val.indexOf(".") !== -1){
                val = Number.parseFloat(val);
            }else{
                val = Number.parseInt(val,10);
            }
        }
    }else{
        val = "";
    }
    return val;
}

var attrsRegx = new RegExp("(\\S+)=.([^'\"]+)","g");
function buildAttributesArr(attrStr,ignore,prefix,ignoreNS){
    attrStr = attrStr || attrStr.trim();
    if(!ignore && attrStr.length > 3){
        var matches = getAllMatches(attrStr,attrsRegx);
        var attrs = {};
        for (var i = 0; i < matches.length; i++) {
            var attrName = prefix + resolveNameSpace( matches[i][1],ignoreNS);
            attrs[attrName] = matches[i][2];
        }
        return attrs;
    }
}

var convertToJson = function (node){
    var jObj = {};
    if(node.val || node.val === "") {
        return node.val;
    }else{
        for (var index = 0; index < node.child.length; index++) {
            var prop = node.child[index].tagname;
            var obj = convertToJson(node.child[index]);
            if(jObj[prop] !== undefined){
                if(!Array.isArray(jObj[prop])){
                    var swap = jObj[prop];
                    jObj[prop] = [];
                    jObj[prop].push(swap);
                }
                jObj[prop].push(obj);
            }else{
                jObj[prop] = obj;
            }
        }
    }
    return jObj;
};

exports.parse = xml2json;
exports.getTraversalObj = getTraversalObj;
exports.convertToJson = convertToJson;
exports.validate = require("./validator").validate;
