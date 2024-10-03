/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Sep 24, 2024
 **/

function Texture([gl], isColor, width, height, repeat, filtering, mipmapping) {
  this.width = width;
  this.height = height;

  this.loadImage = function(fileName) {
    return new Promise(function(resolve, reject) {
      let image = new Image();

      image.addEventListener('load', function(event) {
        gl.bindTexture(gl.TEXTURE_2D, texture_);

        try {
          if (gl instanceof WebGLRenderingContext) gl.texImage2D(gl.TEXTURE_2D,
              0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          else if (isColor) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
              image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
          else gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, image.width, image.height,
              0, gl.RED, gl.UNSIGNED_BYTE, image);
        }
        catch (e) {
          gl.bindTexture(gl.TEXTURE_2D, null);
          error_ = "Texture.loadImage: " + e;
          reject(error_);
          return;
        }

        if (mipmapping) gl.generateMipmap(gl.TEXTURE_2D);

        this.width = image.width;
        this.height = image.height;
        isComplete_ = true;

        gl.bindTexture(gl.TEXTURE_2D, null); 
        resolve();
      }.bind(this));

      image.addEventListener('error', function(event) {
        error_ = "Texture.loadImage: Failed to read texture image.";
        reject(error_);
      });

      image.src = fileName;
    }.bind(this));
  };



  this.loadData = function(pixels) {
    return new Promise(function(resolve, reject) {
      let textureLength = this.width * this.height;
      if (gl instanceof WebGLRenderingContext || isColor)
        textureLength *= 4;

      if (textureLength > pixels.length) {
        error_ = "Texture.loadData: " +
            "desired upload requires more data than is available.";
        reject(error_);
        return;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture_);
      if (gl instanceof WebGLRenderingContext || isColor) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      }
      else {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, this.width, this.height, 0,
            gl.RED, gl.UNSIGNED_BYTE, pixels);
      }

      if (mipmapping) gl.generateMipmap(gl.TEXTURE_2D);
      isComplete_ = true;

      gl.bindTexture(gl.TEXTURE_2D, null); 
      resolve();
    }.bind(this));
  };



  this.startReading = function(textureUnit) {
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture_);
  };



  this.stopReading = function() {
    gl.bindTexture(gl.TEXTURE_2D, null);
  };



  this.isComplete = function() {
    if(typeof error_ === "undefined") return isComplete_;
    else throw (error_);
  };



  this.deleteTexture = function() {
    if (gl.isTexture(texture_))
      gl.deleteTexture(texture_);
  };



  const texture_ = gl.createTexture();
  let isComplete_ = false; 
  let error_ = undefined;

  gl.bindTexture(gl.TEXTURE_2D, texture_);

  if (gl instanceof WebGLRenderingContext || isColor) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, this.width, this.height, 0, gl.RED,
    gl.UNSIGNED_BYTE, null);
  }

  if (repeat) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
  else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } 

  if (filtering)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  if (filtering && mipmapping) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR);
  }
  else if (mipmapping) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_NEAREST);
  }
  else if (filtering)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  gl.bindTexture(gl.TEXTURE_2D, null);

  this.texture = texture_;
}
