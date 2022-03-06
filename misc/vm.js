/*
 * Example VM
 * Running some arbitrary commmands
 *
 */

// Dependencies
var vm = require('vm');

// Define a context for the script to run in
var context = {
    'numberfTheBeast': 666
};

// Define the script
var script = new vm.Script(`
  numberfTheBeast = numberfTheBeast * 2;
  var makeItSaints = numberfTheBeast + 1;
  var magicTesla = 369;
`);

// Run the script
script.runInNewContext(context);
console.log(context);