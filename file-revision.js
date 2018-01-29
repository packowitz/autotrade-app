#!/usr/bin/env node
var md5File = require('md5-file'),
  fs = require('fs');

/**
 * This script renames files inside platforms/browser/www/ folder and updates their references in html files like index.html
 * The mechanism is for improve caching. So file like `main.js` will be renamed to `main.[FILE-MD5-HASH].js` and its references
 * in html files will be updated.
 */
var buildFolder = 'www/';
var assetsFolder = buildFolder + 'build/';

var jsFiles = [
  'main'
];
var cssFiles = [
  'main'
];
var htmlFilesToUpdate = [
  'index.html'
];
var replacements = [];

jsFiles.forEach(function (file) {
  var hash = md5File.sync(assetsFolder + file + '.js');
  renameFile(file + '.js', file + '.' + hash + '.js');
});

cssFiles.forEach(function (file) {
  var hash = md5File.sync(assetsFolder + file + '.css');
  renameFile(file + '.css', file + '.' + hash + '.css');
});
htmlFilesToUpdate.forEach(function (htmlFile) {
  console.log('Update "' + htmlFile + '" with new file revisions.');
  console.log('Replacements: ' + JSON.stringify(replacements));
  replacements.forEach(function(replacementObject) {
    replaceInFile(buildFolder + htmlFile,replacementObject.from, replacementObject.to);
  });
});

function renameFile(input, output) {
  console.log('Rename "' + input + '" to "' + output + '"');
  fs.rename(assetsFolder + input, assetsFolder + output);
  if (fs.existsSync(assetsFolder + input + '.map')) {
    console.log('Rename "' + input + '.map" to "' + output + '.map"');
    fs.rename(assetsFolder + input + '.map', assetsFolder + output + '.map');
  }
  replacements.push({from: input, to: output})
}

function replaceInFile(file, regex, replacement) {
  var fileContents = fs.readFileSync(file, 'utf-8');
  fs.writeFileSync(file, fileContents.replace(regex, replacement), 'utf8');
}
