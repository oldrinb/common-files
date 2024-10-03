/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Sep 25, 2024
 **/


function Mesh([gl, vao_ext],
    positions, colors = null, texCoords = null, indices = null) {
  const vaos_ = new Map();

  const positionBuffer_ = gl.createBuffer();
  const colorBuffer_ = (colors !== null) ? gl.createBuffer() : null;
  const texCoordBuffer_ = (texCoords !== null) ? gl.createBuffer() : null;
  const indexBuffer_ = (indices !== null) ? gl.createBuffer() : null;



  this.loadBuffers = function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        let glPositions = positions, glColors = colors, glTexCoords = texCoords;
        let glIndices = [];

        if (indices) {
          let tempIndices = Array.from(new Set(indices));

          for (let i = 0; i < indices.length; i++) {
            glIndices.push(tempIndices.indexOf(indices[i]));
          }

          glPositions = getGLData_(positions, 3, tempIndices, 0);

          if (colors) {
            glColors = getGLData_(colors, 3, tempIndices, 1);
          }

          if (texCoords) {
            glTexCoords = getGLData_(texCoords, 2, tempIndices, 2);
          }
        }

        if (positions) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glPositions),
              gl.STATIC_DRAW);
        }

        if (colors) {
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(glColors),
              gl.STATIC_DRAW);
        }

        if (texCoords) {
          gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glTexCoords),
              gl.STATIC_DRAW);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glIndices),
            gl.STATIC_DRAW);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        resolve();
      }, 0);
    });
  };



  this.setAttribPointers = function(program,
      vPosition = -1, vColor = -1, vTexCoord = -1) {
    let vao =  null;
    if (gl instanceof WebGLRenderingContext) {
      if (vao_ext) {
        vao = vao_ext.createVertexArrayOES();
        vao_ext.bindVertexArrayOES(vao);
      }
    }
    else {
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
    }

    if (vao) {
      vaos_.set(program, vao);
      setAttribPointers_(vPosition, vColor, vTexCoord);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);
    }

    if (gl instanceof WebGLRenderingContext) {
      if (vao_ext) vao_ext.bindVertexArrayOES(null);
    }
    else gl.bindVertexArray(null);
  };



  this.render = function(program, vPosition = -1, vColor = -1, vTexCoord = -1) {
    if (gl instanceof WebGLRenderingContext) {
      if (vao_ext) {
        const vao = vaos_.get(program);
        vao_ext.bindVertexArrayOES(vao);
      }
      else {
        setAttribPointers_(vPosition, vColor, vTexCoord);
        if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);
      }
    }
    else {
      const vao = vaos_.get(program);
      gl.bindVertexArray(vao); 
    }

    if (indices)
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    else gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);

    if (gl instanceof WebGLRenderingContext) {
      if (vao_ext) vao_ext.bindVertexArrayOES(null);
      else {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      }
    }
    else gl.bindVertexArray(null);
  };



  this.deleteBuffers = function() {
    for (const [program, vao] of vaos_.entries())
      if (gl instanceof WebGLRenderingContext) {
        if (vao_ext && vao_ext.isVertexArrayOES(vao))
          vao_ext.deleteVertexArrayOES(vao);
      }
      else if (gl.isVertexArray(vao)) gl.deleteVertexArray(vao);

    if(gl.isBuffer(positionBuffer_)) gl.deleteBuffer(positionBuffer_);
    if(gl.isBuffer(colorBuffer_)) gl.deleteBuffer(colorBuffer_);
    if(gl.isBuffer(texCoordBuffer_)) gl.deleteBuffer(texCoordBuffer_);
    if(gl.isBuffer(indexBuffer_)) gl.deleteBuffer(indexBuffer_);
  };



  function getGLData_(data, dataSize, indices, dataPos) {
    let tempData1 = [];
    while (data.length) {
      tempData1.push(data.splice(0, dataSize));
    }

    let tempData2 = [];
    for (let i = 0; i < indices.length; i++) {
      let s = indices[i].split("/");
      tempData2.push(tempData1[s[dataPos] - 1]);
    }

    let glData = [];
    for (let i = 0; i < tempData2.length; i++) {
      glData = glData.concat(tempData2[i]);
    }
    return glData;
  }



  function setAttribPointers_(vPosition, vColor, vTexCoord) {
    if (positions && vPosition != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_);
      gl.enableVertexAttribArray(vPosition);
      gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    }

    if (colors && vColor != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_);
      gl.enableVertexAttribArray(vColor);
      gl.vertexAttribPointer(vColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    }

    if (texCoords && vTexCoord != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer_);
      gl.enableVertexAttribArray(vTexCoord);
      gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    }
  }
}
