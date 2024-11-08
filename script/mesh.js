/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Nov 1, 2024
 **/



function Mesh([gl, vao_ext], positions, colors = null, texCoords = null,
    normals = null, tangents = null, bitangents = null, indices = null) {
  const vaos_ = new Map();
  const positionBuffer_ = gl.createBuffer();
  const colorBuffer_ = (colors !== null) ? gl.createBuffer() : null;
  const texCoordBuffer_ = (texCoords !== null) ? gl.createBuffer() : null;
  const normalBuffer_ = (normals !== null) ? gl.createBuffer() : null;
  const tangentBuffer_ = (tangents !== null) ? gl.createBuffer() : null;
  const bitangentBuffer_ = (bitangents !== null) ? gl.createBuffer() : null;
  const indexBuffer_ = (indices !== null) ? gl.createBuffer() : null;



  this.loadBuffers = function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        if (positions) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), 
              gl.STATIC_DRAW);
        }

        if (colors) {
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors),
              gl.STATIC_DRAW);
        }

        if (texCoords) {
          gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords),
              gl.STATIC_DRAW);
        }

        if (normals) {
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals),
              gl.STATIC_DRAW);
        }

        if (tangents) {
          gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangents),
              gl.STATIC_DRAW);
        }

        if (bitangents) {
          gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer_);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitangents),
              gl.STATIC_DRAW);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
            gl.STATIC_DRAW);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        resolve();
      }, 0);
    });
  };



  this.setAttribPointers = function(program, vPosition = -1, vColor = -1,
      vTexCoord = -1, vNormal = -1, vTangent = -1, vBitangent = -1) {
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
      setAttribPointers_
          (vPosition, vColor, vTexCoord, vNormal, vTangent, vBitangent);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);
    }

    if (gl instanceof WebGLRenderingContext) {
      if (vao_ext) vao_ext.bindVertexArrayOES(null);
    }
    else gl.bindVertexArray(null);
  };



  this.render = function(program, vPosition = -1, vColor = -1, vTexCoord = -1,
      vNormal = -1, vTangent = -1, vBitangent = -1) {
    if (gl instanceof WebGLRenderingContext) {
      if (vao_ext) {
        const vao = vaos_.get(program);
        vao_ext.bindVertexArrayOES(vao);
      }
      else {
        setAttribPointers_
            (vPosition, vColor, vTexCoord, vNormal, vTangent, vBitangent);
        if (indices) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_);
      }
    }
    else {
      const vao = vaos_.get(program);
      gl.bindVertexArray(vao);
    }

    if (indices)
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    else if (positions) gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);

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
    if(gl.isBuffer(normalBuffer_)) gl.deleteBuffer(normalBuffer_);
    if(gl.isBuffer(tangentBuffer_)) gl.deleteBuffer(tangentBuffer_);
    if(gl.isBuffer(bitangentBuffer_)) gl.deleteBuffer(bitangentBuffer_);
    if(gl.isBuffer(indexBuffer_)) gl.deleteBuffer(indexBuffer_);
  };



  function setAttribPointers_
      (vPosition, vColor, vTexCoord, vNormal, vTangent, vBitangent) {
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

    if (normals && vNormal != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_);
      gl.enableVertexAttribArray(vNormal);
      gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    }

    if (tangents && vTangent != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer_);
      gl.enableVertexAttribArray(vTangent);
      gl.vertexAttribPointer(vTangent, 3, gl.FLOAT, false, 0, 0);
    }

    if (bitangents && vBitangent != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer_);
      gl.enableVertexAttribArray(vBitangent);
      gl.vertexAttribPointer(vBitangent, 3, gl.FLOAT, false, 0, 0);
    }
  }
}
