
var Format = {};

Format.convertToCamelCase = function(str){
  return str.replace(/(\-)(\w)/g, function(r){return r[1].toUpperCase();});
}

Format.trimSpace = function(str){
  if(typeof str == 'string'){
    str = str.replace(/^[\s]{1,}/, '').replace(/[\s]{1,}$/, '');
  }
  return str;
}

Format.trimNonWordChars = function(str){
  if(typeof str == 'string'){
    str = str.replace(/^[\W]{1,}/, '').replace(/[\W]{1,}$/, '');
  }
  return str;
}

Format.escapeQuotes = function(str){
  if(typeof str == 'string'){
    str = str.replace(/([\"\'])/g, "\\$1");
  }
  return str;
}

Format.htmlEscapeQuotes = function(str){
  if(typeof str == 'string'){
    str = str.replace(/\"/g, "&#34;").replace(/\'/g, "&#39;");
  }
  return str;
}

Format.cleanKey = function(k){
  // trim all non-word-characters
  k = Format.trimNonWordChars(k);
  // convert any snake case (dashes) to camel case
  k = Format.convertToCamelCase(k);
  return k;
}

Format.cleanKeys = function(obj){
  let newObj = {};
  for(var k in obj){
    newObj[Format.cleanKey(k)] = obj[k];
  }
  return newObj;
}

Format.concatUnique = function(arr1, arr2){
  return [...new Set([...arr1 ,...arr2])];
}

Format.convertToNumber = function(val){
  val = Format.trimNonWordChars(val+''); // trim any irrelevant characters from the beginning and end of the string
  val = val.replace(/[\.\s]/g,''); // remove any points or spaces (swedish thousands separators)
  val = val.replace(/[\,]/, "."); // convert any commas to points for proper float format
  val = parseFloat(val);
  if(typeof val !== 'number' || isNaN(val)){
    val = 0;
  }
  return val;
}

module.exports = Format;
