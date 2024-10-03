/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Aug 5, 2024
 **/

var testCanvas = document.createElement("canvas");

function testES6() {
  try {
    Function("() => {};");
    return true;
  }
  catch (e) {
    return false;
  }
}

if (!testCanvas.getContext)
  document.body.innerHTML =
      "<p class='error'>Your browser does not support HTML 5 Canvas.</p>";
else if (!testES6())
  document.body.innerHTML =
      "<p class='error'>" +
        "Your browser does not support JavaScript ES6 (ECMAScript 2015)." +
      "</p>";
