/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Sep 24, 2024
 **/

function Framebuffer([gl, draw_ext],
    isColor, width, height, nBuffers, hasDepthBuffer, filtering) {
  this.isColor = isColor;
  this.width = width;
  this.height = height;
  this.nBuffers = nBuffers;

  this.textures = [];
  this.fbo = null;

  this.startDrawing = function() {
    let buffers = [];

    if (gl instanceof WebGLRenderingContext) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

      if (draw_ext) {
        for (let i = 0; i < nBuffers; i++) 
          buffers.push(draw_ext.COLOR_ATTACHMENT0_WEBGL + i);
        draw_ext.drawBuffersWEBGL(buffers);
      }
    }
    else {
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.fbo);

      for (let i = 0; i < nBuffers; i++) 
        buffers.push(gl.COLOR_ATTACHMENT0 + i);
      gl.drawBuffers(buffers);
    }
  };



  this.stopDrawing = function() {
    if (gl instanceof WebGLRenderingContext) 
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    else gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  };



  this.startReading = function(idBuffer, textureUnit) {
    if (idBuffer < 0 || idBuffer > nBuffers - 1)
      throw ("Framebuffer.startReading: Invalid buffer id.");

    if (!(gl instanceof WebGLRenderingContext))
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo);

    this.textures[idBuffer].startReading(textureUnit);
  };



  this.stopReading = function() {
    if (!(gl instanceof WebGLRenderingContext))
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

    this.textures[0].stopReading();
  };



  this.readPixels = function(idBuffer) {
    if (idBuffer < 0 || idBuffer > nBuffers - 1)
      throw ("Framebuffer.readPixels: Invalid buffer id.");

    let pixels = (gl instanceof WebGLRenderingContext || isColor) ?
        new Uint8Array(width * height * 4) : new Uint8Array(width * height);
    if (gl instanceof WebGLRenderingContext) {
      if (draw_ext) {
        let fbo = gl.createFramebuffer();

        try {
          initFramebuffer_(fbo, [this.textures[idBuffer]], null);
        }
        catch (error) {
          gl.deleteFramebuffer(fbo);
          throw ("Framebuffer.readPixels." + error);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.deleteFramebuffer(fbo);
      }
      else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
    else {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo);
      gl.readBuffer(gl.COLOR_ATTACHMENT0 + idBuffer);

      if (isColor)
          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      else gl.readPixels(0, 0, width, height, gl.RED, gl.UNSIGNED_BYTE, pixels);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    }
    return pixels;
  };



  this.copy = function(source) {
    if (nBuffers != source.nBuffers) throw ("Framebuffer.copy: " + 
        "Framebuffers have not the same number of buffers.");
    if (isColor != source.isColor) throw ("Framebuffer.copy: " + 
        "Framebuffers have not the same kind of textures.");
    if (width != source.width || height != source.height)
        throw ("Framebuffer.copy: Framebuffers are not the same size.");

    if (gl instanceof WebGLRenderingContext) {
      if (draw_ext) {
        let fbos = [];
        for (let i = 0; i < nBuffers; i++) {
          fbos[i] = gl.createFramebuffer();

          try {
            initFramebuffer_(fbos[i], [source.textures[i]], null);
          }
          catch (error) {
            for (let j = 0; j < fbos.length; j++)
              if (gl.isFramebuffer(fbos[j]))
                gl.deleteFramebuffer(fbos[j]);

            throw ("Framebuffer.copy." + error);
          }

          gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[i]);
          gl.bindTexture(gl.TEXTURE_2D, this.textures[i].texture);
          gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0);
          gl.bindTexture(gl.TEXTURE_2D, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);

          gl.deleteFramebuffer(fbos[i]);
        }
      }
      else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, source.fbo);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0].texture);
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }

    else {
      this.startDrawing();
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.fbo);
      for (let i = 0; i < nBuffers; i++) {
        let buffers = [];
        for (let j = 0; j < nBuffers; j++) {
          if (i == j) buffers.push(gl.COLOR_ATTACHMENT0 + i);
          else buffers.push(gl.NONE);
        }

        gl.drawBuffers(buffers);
        gl.readBuffer(gl.COLOR_ATTACHMENT0 + i);
        gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height,
            gl.COLOR_BUFFER_BIT, gl.NEAREST);
      }
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      this.stopDrawing();
    }
  };



  this.deleteFramebuffer = function() {
    for (let i = 0; i < nBuffers; i++)
      if (typeof this.textures[i] !== "undefined")
        this.textures[i].deleteTexture();

    if (rbo_ && gl.isRenderbuffer(rbo_))
      gl.deleteRenderbuffer(rbo_);

    if (gl.isFramebuffer(this.fbo))
      gl.deleteFramebuffer(this.fbo);
  };



  function initFramebuffer_(fbo, textures, rbo) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    if (gl instanceof WebGLRenderingContext) {
      if (draw_ext) {
        for (let i = 0; i < textures.length; i++)
          gl.framebufferTexture2D(gl.FRAMEBUFFER,
              draw_ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D,
              textures[i].texture, 0);
      }
      else gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
               gl.TEXTURE_2D, textures[0].texture, 0);
    }
    else for (let i = 0; i < textures.length; i++) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i,
          gl.TEXTURE_2D, textures[i].texture, 0);
    }

    if (rbo) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
          width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER, rbo);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      let message;
      switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 
          message = "The attachment types are mismatched or not all " +
              "framebuffer attachment points are framebuffer attachment " +
              "complete.";
          break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 
          message = "There is no attachment.";
          break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 
          message = "Height and width of the attachment are not the same.";
          break;
        case gl.FRAMEBUFFER_UNSUPPORTED: 
          message = "The format of the attachment is not supported or if " +
              "depth and stencil attachments are not the same renderbuffer.";
          break;
        case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: 
          message = "The values of gl.RENDERBUFFER_SAMPLES are different " +
              "among attached renderbuffers, or are non-zero if the attached " +
              "images are a mix of renderbuffers and textures.";
          break;
        default: message = "Unknown error.";
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw ("initFramebuffer: Framebuffer not complete. " + message);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }



  let nMaxBuffers_ = 1, nMaxAttachments_ = 1;
  let rbo_ = null;

  if (gl instanceof WebGLRenderingContext) {
    if (draw_ext) {
      nMaxBuffers_ = gl.getParameter(draw_ext.MAX_DRAW_BUFFERS_WEBGL);
      nMaxAttachments_ = gl.getParameter(draw_ext.MAX_COLOR_ATTACHMENTS_WEBGL);
    }
  }
  else {
    nMaxBuffers_ = gl.getParameter(gl.MAX_DRAW_BUFFERS);
    nMaxAttachments_ = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);
  }

  if (nBuffers < 1 || nBuffers > nMaxBuffers_ || nBuffers > nMaxAttachments_)
    throw ("Framebuffer: Invalid number of buffers.");


  for (let i = 0; i < nBuffers; i++) {
    let tex = new Texture([gl],isColor, width, height, false, filtering, false);
    this.textures.push(tex);
  }

  this.fbo = gl.createFramebuffer();
  if (hasDepthBuffer) rbo_ = gl.createRenderbuffer();

  try {
    initFramebuffer_(this.fbo, this.textures, rbo_);
  }
  catch (error) {
    this.deleteFramebuffer();
    throw ("Framebuffer." + error);
  }
}
