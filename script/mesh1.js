/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Aug 3, 2024
 **/


 function Mesh([gl, vao_ext], positions, colors, texCoords, indices) {
  this.loadBuffers = function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        let glPositions = positions, glColors = colors, glTexCoords = texCoords;
        let glIndices;

        if (indices) {
          let tempIndices = Array.from(new Set(indices));

          glIndices = [];
          for (let i = 0; i < indices.length; i++) {
            glIndices.push(tempIndices.indexOf(indices[i]));
          }

          if (positions) {
            let tempPos1 = [];
            while (positions.length) tempPos1.push(positions.splice(0, 3));

            let tempPos2 = [];
            for (let i = 0; i < tempIndices.length; i++) {
              let s = tempIndices[i].split("/");
              tempPos2.push(tempPos1[s[0] - 1]);
            }

            glPositions = [];
            for(let i = 0; i < tempPos2.length; i++)
              glPositions = glPositions.concat(tempPos2[i]);
          }

          if (colors) {
            let tempCol1 = [];
            while(colors.length) tempCol1.push(colors.splice(0,3));

            let tempCol2 = [];
            for (let i = 0; i < tempIndices.length; i++) {
              let s = tempIndices[i].split("/");
              tempCol2.push(tempCol1[s[1] - 1]);
            }

            glColors = [];
            for(let i = 0; i < tempCol2.length; i++)
              glColors = glColors.concat(tempCol2[i]);
          }

          if (texCoords) {
            let tempTex1 = [];
            while(texCoords.length) tempTex1.push(texCoords.splice(0,2));

            let tempTex2 = [];
            for (let i = 0; i < tempIndices.length; i++) {
              let s = tempIndices[i].split("/");
              tempTex2.push(tempTex1[s[2] - 1]);
            }

            glTexCoords = [];
            for(let i = 0; i < tempTex2.length; i++) 
              glTexCoords = glTexCoords.concat(tempTex2[i]);
          }
        }

        if (positions) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_);

          if (gl instanceof WebGLRenderingContext) {
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glPositions),
                gl.STATIC_DRAW);
          }
          else {
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glPositions),
                gl.STATIC_DRAW, 0);
          }
        }

        if (colors) {
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_);

          if (gl instanceof WebGLRenderingContext) {
            gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(glColors), 
                gl.STATIC_DRAW);
          }
          else {
            gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(glColors),
                gl.STATIC_DRAW, 0);
          }
        }

        if (texCoords) {
          gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer_);

          if (gl instanceof WebGLRenderingContext) {
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glTexCoords),
                gl.STATIC_DRAW);
          }
          else {
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glTexCoords),
                gl.STATIC_DRAW, 0);
          }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);

          if (gl instanceof WebGLRenderingContext) {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glIndices),
                gl.STATIC_DRAW);
          }
          else {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glIndices),
                gl.STATIC_DRAW, 0);
          }

          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_, null);
        }

        resolve();
      }, 0);
    });
  };



  this.setAttribPointers = function(program, vPosition, vColor, vTexCoord) {
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



  this.render = function(program, vPosition, vColor, vTexCoord) {
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



  function setAttribPointers_(vPosition, vColor, vTexCoord) {
    if (positions && vPosition != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_);
      gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);
    }

    if (colors && vColor != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_);
      gl.vertexAttribPointer(vColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);
      gl.enableVertexAttribArray(vColor);
    }

    if (texCoords && vTexCoord != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer_);
      gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vTexCoord);
    }
  }



  const vaos_ = new Map();
  let positionBuffer_, colorBuffer_, texCoordBuffer_, indexBuffer_;

  if (positions) positionBuffer_ = gl.createBuffer();
  if (colors) colorBuffer_ = gl.createBuffer();
  if (texCoords) texCoordBuffer_ = gl.createBuffer();

  if (indices) indexBuffer_ = gl.createBuffer();
}
