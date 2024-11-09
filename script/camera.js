/*<?xml version="1.0" encoding="utf-8"?>*/

/**
 * Author: Oldrin Bărbulescu
 * Last modified: Nov 9, 2024
 **/

//fieldOfView in degrees
function Camera(position, lookAt, fieldOfView, nearPlane, farPlane) {
  const MIN_FOV_ = 5.0; //degrees
  const MAX_FOV_ = 85.0; //degrees
  const MAX_VERTICAL_ANGLE_ = 0.785398; //radians(45 degrees)
  const EPSILON_ = 0.0001;

  let position_ = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
  let lookAt_ = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
  let fieldOfView_ = Math.PI / 4.0;
  let aspectRatio_ = 4.0/3.0;
  let nearPlane_ = 0.1;
  let farPlane_ = 100;

  let forward_ = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
  let right_ = glMatrix.vec3.fromValues(1.0, 0.0, 0.0);
  let up_ = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
  let temp_ = glMatrix.vec3.create();

  let ro_ = 1.0;
  let horizontalAngle_ = Math.PI;
  let verticalAngle_ = 0.0;

  let viewMatrix_ = glMatrix.mat4.create();
  let projMatrix_ = glMatrix.mat4.create();
  let viewProjMatrix_ = glMatrix.mat4.create();



  this.setPosition = function(position) {
    if (glMatrix.vec3.equals(lookAt_, position)) throw ("Camera.setPosition: " +
        "Camera 'position' and 'lookAt' are identical.");
    else glMatrix.vec3.copy(position_, position);

    updateAngles_();
    updateDirections_(false);
    updateViewMatrix_();
  };



  this.setLookAt = function(lookAt) {
    if (glMatrix.vec3.equals(position_, lookAt))
      throw ("Camera.setLookAt: Camera 'position' and 'lookAt' are identical.");
    else glMatrix.vec3.copy(lookAt_, lookAt);

    updateAngles_();
    updateDirections_(false);
    updateViewMatrix_();
  };



  this.setFieldOfView = function(fieldOfView) { //degrees
    if (fieldOfView >= MIN_FOV_ && fieldOfView <= MAX_FOV_)
      fieldOfView_ = fieldOfView * Math.PI / 180.0;
    else throw("Camera.setFieldOfView: Invalid field of view value.");

    updateProjMatrix_();
  };



  this.setAspectRatio = function(aspectRatio) {
    if (aspectRatio > 0 && aspectRatio < 1.0/EPSILON_) 
      aspectRatio_ = aspectRatio;
    else  throw("Camera.setAspectRatio: Invalid aspect ratio value.");

    updateProjMatrix_();
  };



  this.setDepthRange = function(nearPlane, farPlane) {
    if (nearPlane >=0 && nearPlane < farPlane) {
      nearPlane_ = nearPlane;
      farPlane_ = farPlane;
    }
    else throw("Camera.setDepthRange: Invalid near plane or far plane values.");

    updateProjMatrix_();
  };



  this.translateRight = function(distance) {
    glMatrix.vec3.scale(temp_, right_, distance);
    glMatrix.vec3.add(position_, position_, temp_);
    glMatrix.vec3.add(lookAt_, lookAt_, temp_);

    updateViewMatrix_();
  };



  this.translateUp = function(distance) {
    glMatrix.vec3.scale(temp_, up_, distance);
    glMatrix.vec3.add(position_, position_, temp_);
    glMatrix.vec3.add(lookAt_, lookAt_, temp_);

    updateViewMatrix_();
  };



  this.translateForward = function(distance) {
    glMatrix.vec3.scale(temp_, forward_, distance);
    glMatrix.vec3.add(position_, position_, temp_);

    glMatrix.vec3.subtract(temp_, lookAt_, position_);
    ro_ = glMatrix.vec3.length(temp_);

    updateViewMatrix_();
  };



  this.rotateRight = function(angle) { //degrees
    horizontalAngle_ += angle * Math.PI / 180.0;
    
    horizontalAngle_ = (horizontalAngle_ > 2 * Math.PI) ?
        horizontalAngle_ - 2 * Math.PI :
        (horizontalAngle_ < 0) ?
        horizontalAngle_ + 2 * Math.PI : horizontalAngle_;

    updateDirections_(true);
    updateViewMatrix_();
  };



  this.rotateUp = function(angle) { //degrees
    let result = verticalAngle_ + angle * Math.PI / 180.0;
    if (Math.abs(result) <= MAX_VERTICAL_ANGLE_)
      verticalAngle_ = result;
    else throw ("Camera.rotateUp: Invalid vertical angle value.");

    updateDirections_(true);
    updateViewMatrix_();
  };



  this.getMinFieldOfView = function() {
    return MIN_FOV_;
  };



  this.getMinFieldOfView = function() {
    return MAX_FOV_;
  };



  this.getViewMatrix = function() {
    return viewMatrix_;
  };



  this.getProjMatrix = function() {
    return projMatrix_;
  };



  this.getViewProjMatrix = function() {
    return viewProjMatrix_;
  };



  function updateViewMatrix_() {
    glMatrix.mat4.lookAt(viewMatrix_, position_, lookAt_, up_);
    glMatrix.mat4.multiply(viewProjMatrix_, projMatrix_, viewMatrix_);
  }



  function updateProjMatrix_() {
    glMatrix.mat4.perspective
        (projMatrix_, fieldOfView_, aspectRatio_, nearPlane_, farPlane_);
    glMatrix.mat4.multiply(viewProjMatrix_, projMatrix_, viewMatrix_);
  }



  function updateDirections_(updateForward) {
    if (updateForward) {
      glMatrix.vec3.set(forward_,
          Math.cos(verticalAngle_) * Math.sin(horizontalAngle_),
          Math.sin(verticalAngle_),
          Math.cos(verticalAngle_) * Math.cos(horizontalAngle_));

      glMatrix.vec3.scale(temp_, forward_, ro_);
      glMatrix.vec3.subtract(position_, lookAt_, temp_);
    }

    glMatrix.vec3.set(right_, Math.sin(horizontalAngle_ - Math.PI / 2.0),
        0, Math.cos(horizontalAngle_ - Math.PI / 2.0));

    glMatrix.vec3.cross(up_, right_, forward_);
  }


  
  function updateAngles_() { 
    glMatrix.vec3.subtract(forward_, lookAt_, position_);
    ro_ = glMatrix.vec3.length(forward_);

    glMatrix.vec3.normalize(forward_, forward_);
    verticalAngle_ = Math.asin(forward_[1]);

    if (Math.abs(verticalAngle_ + MAX_VERTICAL_ANGLE_) < EPSILON_)
      verticalAngle_ = - MAX_VERTICAL_ANGLE_;
    else if (Math.abs(verticalAngle_ - MAX_VERTICAL_ANGLE_) < EPSILON_)
      verticalAngle_ = MAX_VERTICAL_ANGLE_;

    if (verticalAngle_ > MAX_VERTICAL_ANGLE_) 
      verticalAngle_ = MAX_VERTICAL_ANGLE_;
    else if (verticalAngle_ < -MAX_VERTICAL_ANGLE_)
      verticalAngle_ = -MAX_VERTICAL_ANGLE_;

    let sinHorizontalAngle = forward_[0] / Math.cos(verticalAngle_);
    let cosHorizontalAngle = forward_[2] / Math.cos(verticalAngle_);

    sinHorizontalAngle = clamp_(sinHorizontalAngle, -1.0, 1.0);
    horizontalAngle_ = Math.asin(sinHorizontalAngle);
    if (cosHorizontalAngle < 0.0)
      horizontalAngle_ = Math.PI - horizontalAngle_;
  }



  function clamp_(value, min, max) {
    if (value < min) return min;
    else if (value > max) return max;
    else return value;
  }



  this.setPosition(position);
  this.setLookAt(lookAt);
  this.setFieldOfView(fieldOfView);
  this.setDepthRange(nearPlane, farPlane);
}
