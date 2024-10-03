/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Sep 24, 2024
 **/

 
const util = {
  rotationAngle: 0.0,
  fps: 0,

  lastTime_: 0.0, lastFrameTime_: 0.0, frameCount_: 0,



  update: function(now, rotationSpeed) {
    let deltaTime = now - this.lastTime_;

    this.rotationAngle +=  rotationSpeed * deltaTime;
    this.rotationAngle = (this.rotationAngle > 2 * Math.PI) ?
        this.rotationAngle - 2 * Math.PI : this.rotationAngle;

    this.frameCount_++;
    if (now - this.lastFrameTime_ >= 1000) {
      this.fps = this.frameCount_;
      this.frameCount_ = 0;
      this.lastFrameTime_ = now;
    }

    this.lastTime_ = now;
  },



  getErrorMessage: function(errorCode) {
    let message = " More information can be found by checking your browser's " +
        "developer console."
    switch (errorCode) {
      case "webgl":
        return "Unfortunately, it looks like your browser or device does not " +
          "support WebGL. This technology is needed for this webpage to work.";
      case "webgl2":
        return "Unfortunately, it looks like your browser or device does not " +
          "support WebGL2. This technology is needed for this webpage to work.";
      case "webgl-ext":
        return "Unfortunately, it looks like your browser or device does not " +
            "support WebGL required extensions. They are required in order " +
            "for this webpage to work.";
      case "init":
        return "An error occurred initializing the WebGL content on this page."
            + message;
      case "render":
        return "An error occurred running the WebGL content on this page."
            + message;
      case "resize":
        return "An error occurred trying to resize the canvas on this page."
            + message;
      case "texture":
        return "An error occurred trying to load the texture image." + message;
      case "framebuffer":
        return "An error occurred trying to create the framebuffer objects."
            + message; 
      default: return "Unknown error.";
    }
  },



  getGLErrorMessage: function(gl, errorCode) {
    let message = "WebGL: ";
    switch (errorCode) {
      case gl.NO_ERROR:
        return message + "NO_ERROR. No error has been recorded.";
      case gl.INVALID_ENUM: 
        return message + "INVALID_ENUM. An unacceptable value has been "
                       + "specified for an enumerated argument.";
      case gl.INVALID_VALUE:
        return message + "INVALID_VALUE. A numeric argument is out of range.";
      case gl.INVALID_OPERATION:
        return message + "INVALID_OPERATION. The specified command is not "
                       + "allowed for the current state.";
      case gl.INVALID_FRAMEBUFFER_OPERATION:
        return message + "INVALID_FRAMEBUFFER_OPERATION. The currently bound "
                       + "framebuffer is not framebuffer complete when trying "
                       + "to render to or to read from it.";
      case gl.OUT_OF_MEMORY:
        return message + "OUT_OF_MEMORY. Not enough memory is left to execute "
                       + "the command.";
      case gl.CONTEXT_LOST_WEBGL:
        return message + "CONTEXT_LOST_WEBGL. The WebGL context is lost.";
      default: 
        return message + "Unknown error.";
    }
  },



  displayError: function(message, description) {
    let p = document.getElementsByTagName("P");
    for (let i = 0; i < p.length; i++)
      if (p[i].className === "error") {
        if (message) {
          p[i].innerHTML = message;
          p[i].style.display = "block";

          if (description) console.error(description);
        }
        else p[i].style.display = "none";
      }
  },



  enableInputControl: function(name, enabled) {
    this.displayInputControl(name, undefined, enabled);
  },



  displayInputControl: function(name, visible, enabled) {
    let elements = document.getElementsByName(name);

    function enableControl(name, enabled) {
      let labels = document.getElementsByTagName("LABEL");

      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == "INPUT" ||
            elements[i].tagName == "SELECT" ||
            elements[i].tagName == "TEXTAREA") {
              
          if (elements[i].readOnly || elements[i].hidden)
            elements[i].disabled = true;
          else elements[i].disabled = !enabled;
          elements[i].className = enabled ? "enabled" : "disabled";

          for (let j = 0; j < labels.length; j++) {
            if (labels[j].htmlFor == elements[i].id) {
              let className = labels[j].className;
              let index = className.indexOf("disabled");

              if (enabled && index != -1)
                labels[j].className = className.substring(0, index - 1);
              else if (!enabled && index == -1) {
                if (labels[j].className != "")
                  labels[j].className = className.concat(" ");
                labels[j].className = labels[j].className.concat("disabled");
              }
            }
          }
        }
      }
    }

    function displayControl(name, visible) {
      for (let i = 0; i < elements.length; i++)
        if (elements[i].tagName == "INPUT" ||
            elements[i].tagName == "SELECT" ||
            elements[i].tagName == "TEXTAREA") {
          let parent = elements[i].parentElement;
          while (parent.tagName != "TR" && parent.tagName != "DIV")
            parent = parent.parentElement;
          if (visible) parent.removeAttribute("hidden");
          else parent.setAttribute("hidden", "hidden");

          let sibling = parent.parentElement.firstChild;
          while (sibling) {
            if (sibling != parent && 
                  (sibling.tagName == "TR" || sibling.tagName == "DIV")) {
              let labels = sibling.getElementsByTagName("LABEL");
              for (let j = 0; j < labels.length; j++) {
                if (labels[j].htmlFor == elements[i].id) { 
                  if (visible) sibling.removeAttribute("hidden");
                  else sibling.setAttribute("hidden", "hidden");
                  break;
                }
              }
            }
            sibling = sibling.nextElementSibling;
          }
        }
    }

    if (typeof visible !== "undefined") displayControl(name, visible);
    if (typeof enabled !== "undefined") enableControl(name, enabled);
  }
}; 
