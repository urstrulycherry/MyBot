/* eslint-disable */
var fs = require('fs');
//get all files in modules folder
var files = fs.readdirSync('../');
// print all and filter out all files
files.forEach(function (file: any) {
    console.log(file);
})