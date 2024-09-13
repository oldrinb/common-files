/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Aug 3, 2024
 **/

function Program([gl], vertexShaderSource, fragmentShaderSource) {
  this.compile = function() {
    return Promise.all([compileShader_(vertexShader_, vertexShaderSource),
                        compileShader_(fragmentShader_, fragmentShaderSource)])
          .then(function(values) {
            return linkProgram_();
          });
  };



  this.start = function() {
    gl.useProgram(program_);
  };



  this.stop = function() {
    gl.useProgram(null);
  };



  this.getAttribLocation = function(name) {
    let location = gl.getAttribLocation(program_, name);
    if (location == -1) {
      throw ("Program.getAttribLocation: Attribute location not valid: " +
          name);
    }
    return location;
  };



  this.getUniformLocation = function(uniform) {
    let location = gl.getUniformLocation(program_, uniform);
    if (!location) {
      throw ("Program.getUniformLocation: Uniform location not valid: " + 
          uniform);
    }
    return location;
  };



  this.setUniformi = function(location, value) {
    gl.uniform1i(location, value);
  };



  this.setUniformui = function(location, value) {
    if (gl instanceof WebGLRenderingContext)
      gl.uniform1i(location, value);
    else gl.uniform1ui(location, value);
  };



  this.setUniformf = function(location, value) {
    gl.uniform1f(location, value);
  };



  this.setUniformVector2i = function(location, value) {
    gl.uniform2iv(location, value);
  };



  this.setUniformVector2ui = function(location, value) {
    if (gl instanceof WebGLRenderingContext)
      gl.uniform2iv(location, value);
    else gl.uniform2uiv(location, value);
  };



  this.setUniformVector2f = function(location, value) {
    gl.uniform2fv(location, value);
  };



  this.setUniformVector3f = function(location, value) {
    gl.uniform3fv(location, value);
  };



  this.setUniformVector4f = function(location, value) {
    gl.uniform4fv(location, value);
  };



  this.setUniformMatrix4f = function(location, value) {
    gl.uniformMatrix4fv(location, false, value);
  };



  this.deleteProgram = function() {
    deleteShaders_();
    deleteProgram_();
  };



  this.getWebGLProgram = function() {
    return program_;
  };



  function compileShader_(shader, source) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (gl.isContextLost()) {
          reject('Program.compileShader: The WebGL context is lost.');
          return;
        }

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          resolve();
        else {
          let info = gl.getShaderInfoLog(shader);
          reject('Program.compileShader: Shader compilation failed. ' + info);
        }
      }, 0);
    });
  }



  function linkProgram_() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        gl.attachShader(program_, vertexShader_);
        gl.attachShader(program_, fragmentShader_);

        gl.linkProgram(program_);

        gl.detachShader(program_, vertexShader_);
        gl.detachShader(program_, fragmentShader_);
        deleteShaders_();

        if (gl.isContextLost()) {
          reject('Program.linkProgram: The WebGL context is lost.');
          return;
        }

        if (gl.getProgramParameter(program_, gl.LINK_STATUS))
          resolve();
        else {
          let info = gl.getProgramInfoLog(program_);
          reject('Program.linkProgram: Program linking failed. ' + info);
        }
      }, 0);
    });
  }



  function deleteShaders_() {
    if(gl.isShader(vertexShader_))
      gl.deleteShader(vertexShader_);

    if(gl.isShader(fragmentShader_))
      gl.deleteShader(fragmentShader_);
  }



  function deleteProgram_() {
    if(gl.isProgram(program_))
      gl.deleteProgram(program_);
  }



  const program_ = gl.createProgram();
  const vertexShader_ = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader_ = gl.createShader(gl.FRAGMENT_SHADER);
}
