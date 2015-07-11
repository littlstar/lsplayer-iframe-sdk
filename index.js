
/**
 * Module dependencies.
 * @private
 */

var rpc = require('littlstar/frame-rpc@master')
  , merge = require('yields/merge')
  , Emitter = require('component/emitter')
  , domready = require('components/domready')

/**
 * Global callback function name.
 *
 * @private
 * @const
 * @type {String}
 */

const GLOBAL_CALLBACK_NAME = 'OnLSPlayerFrameReady';

/**
 * Iframe class name.
 *
 * @private
 * @const
 * @type {String}
 */
const IFRAME_CLASS_NAME = 'lsplayer-frame';

/**
 * Frame count used to generate an id for the frame.
 *
 * @private
 * @type {Number}
 */

var FRAME_COUNT = 0;

// initialize when DOM s ready
domready(InitializeFrameRPC);

/**
 * Packahe information.
 *
 * @private
 * @const
 * @type {Object}
 */

const pkg = require('./package.json');

// emit package information
console.info("%s@%s", pkg.name, pkg.version);

/**
 * Initializes the iframe SDK.
 * The GLOBAL_CALLBACK_NAME is called when
 * the state is ready and communication between
 * the frames have been established.
 *
 * @private
 * @name InitializeFrameRPC
 */

module.exports = InitializeFrameRPC;
function InitializeFrameRPC () {
  var iframes = document.querySelectorAll('.'+ IFRAME_CLASS_NAME);
  Array.prototype.forEach.call(iframes, function (iframe) {
    LSPlayerRPC(iframe);
  });
}

/**
 * A class representing an interface for calling
 * remote procedure calls to an LSPlayer instance
 * inside of an iframe.
 *
 * @public
 * @class LSPlayerRPC
 * @constructor
 * @extends EventEmitter
 */

module.exports.LSPlayerRPC = LSPlayerRPC;
function LSPlayerRPC (iframe) {
  // ensure instance
  if (!(this instanceof LSPlayerRPC)) {
    return new LSPlayerRPC(iframe);
  }

  var self = this;
  var state = new LSPlayerState();

  /** Player ID. */
  this.id = FRAME_COUNT++;

  /** RPC Gateway. */
  this.gateway = null;

  /** Player iframe DOM Element. */
  this.iframe = iframe;

  /** Player iframe source URL instance. */
  this.src = new window.URL(iframe.getAttribute('src'));

  /** Player iframe origin. */
  this.origin = this.src.protocol + '//' + this.src.host;

  this.on('state', function (data) {
    // update state object when state is emitted
    merge(state, data);
  });

  this.iframe.addEventListener('load', function () {
    self.gateway = rpc(window, iframe.contentWindow, self.origin, {
      emit: function (event, data, cb) {
        self.emit(event, data);
        cb();
      }
    });

    self.gateway.call('initialize', function () {
      var fn = window[GLOBAL_CALLBACK_NAME];
      if ('function' == typeof fn) {
        fn(self, state);
      } else {
        throw new TypeError("Expecting "+ GLOBAL_CALLBACK_NAME +" to be defined.");
      }
    });
  });
}

// inherit `EventEmitter'
Emitter(LSPlayerRPC.prototype);

/**
 * Makes an RPC call via the gateway.
 *
 * @private
 * @param {Mixed} ...args
 */

LSPlayerRPC.prototype.call_ = function () {
  if (this.gateway) {
    this.gateway.call.apply(this.gateway, arguments);
  }
  return this;
};

/**
 * Sets player source
 *
 * @public
 * @param {String} url - Source url string
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.source = function (url, cb) {
  return this.call_('source', url, cb);
};

/**
 * Plays video
 *
 * @public
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.play = function (cb) {
  return this.call_('play', cb);
};

/**
 * Pauses video
 *
 * @public
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.pause = function (cb) {
  return this.call_('pause', cb);
};

/**
 * Stops video
 *
 * @public
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.stop = function (cb) {
  return this.call_('stop', cb);
};

/**
 * Seeks video in seconds
 *
 * @public
 * @param {Number} seconds
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.seek = function (seconds, cb) {
  return this.call_('seek', seconds, cb);
};

/**
 * Sets player volume
 *
 * @public
 * @param {Number} volume
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.volume = function (volume, cb) {
  return this.call_('volume', volume, cb);
};

/**
 * Sets player projection
 *
 * @public
 * @param {Number} projection
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.projection = function (projection, cb) {
  return this.call_('projection', projection, cb);
};

/**
 * Sets player width
 *
 * @public
 * @param {Number} width
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.width = function (width, cb) {
  width = parseFloat(width);
  this.iframe.width = width;
  this.iframe.style.width = width + 'px';
  return this.call_('width', width, cb);
};

/**
 * Sets player height
 *
 * @public
 * @param {Number} height
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.height = function (height, cb) {
  height = parseFloat(height);
  this.iframe.height = height;
  this.iframe.style.height = height + 'px';
  return this.call_('height', height, cb);
};

/**
 * Sets player size
 *
 * @public
 * @param {Number} width
 * @param {Number} height
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.size = function (width, height, cb) {
  height = parseFloat(height);
  width = parseFloat(width);
  this.iframe.height = height;
  this.iframe.width = height;
  this.iframe.style.height = height + 'px';
  this.iframe.style.width = width + 'px';
  return this.call_('size', width, height, cb);
};

/**
 * Sets player orientation
 *
 * @public
 * @param {Number} x
 * @param {Number} y
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.orientation = function (x, y, cb) {
  return this.call_('orientation', x, y, cb);
};

/**
 * Configures rotation on an axis
 *
 * @public
 * @param {Number} coord
 * @param {Object} opts
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.rotate = function (coord, opts, cb) {
  return this.call_('rotate', coord, opts, cb);
};

/**
 * Focuses player
 *
 * @public
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.focus = function (cb) {
  this.iframe.focus();
  return this.call_('focus', cb);
};

/**
 * Unfocuses player
 *
 * @public
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.unfocus = function (cb) {
  this.iframe.blur();
  return this.call_('unfocus', cb);
};

/**
 * Set field of view for player
 *
 * @public
 * @param {Number} fov
 * @param {Function} [cb] - Optional callback
 */

LSPlayerRPC.prototype.fov = function (fov, cb) {
  return this.call_('fov', fov, cb);
};

/**
 * A class representing state that also emits
 * events as they occur on an LSPlayer instance
 * inside of an iframe.
 *
 * @public
 * @class LSPlayerState
 * @constructor
 */

function LSPlayerState () {
  // ensure instance
  if (!(this instanceof LSPlayerState)) {
    return new LSPlayerState();
  }

  /** The known interpolation factor for the player. */
  this.interpolationFactor = 0;

  /** The known scroll velocity for the player. */
  this.scrollVelocity = 0;

  /** The known percent loaded of a video or photo. */
  this.percentloaded = 0;

  /** The known mouse friction. */
  this.mouseFriction = 0;

  /** The known original sizes. */
  this.originalsize = {width: 0, heigit: 0};

  /** The known current time played in a video. */
  this.currentTime = 0;

  /** The known projection type. */
  this.projection = null;

  /** The known last volume value. */
  this.lastVolume = 0;

  /** The known last refresh time stamp. */
  this.lastRefresh = 0;

  /** The last known x coordinate for the mouse. */
  this.pointerX = 0;

  /** The last known y coordinate for the mouse. */
  this.pointerY = 0;

  /** The known duration for a video. */
  this.duration = 0;

  /** The known friction value for rotations. */
  this.friction = 0;

  /** The known radius of the sphere geometry. */
  this.radius = 0;

  /** The known heigit of the player. */
  this.height = 0;

  /** The known width of the player. */
  this.width = 0;

  /** The known field of view. */
  this.fov = 0;

  /** The known source of the video or photo. */
  this.src = null;

  /** Predicate indicating the player is ready. */
  this.isReady = false;

  /** Predicate indicating if player is muted. */
  this.isMuted = false;

  /** Predicate indicating if the video has ended. */
  this.isEnded = false;

  /** Predicate indicating if player is focused. */
  this.isFocused = false;

  /** Predicate indicating if a key is down on player. */
  this.isKeydown = false;

  /** Predicate indicating if video is playing. */
  this.isPlaying = false;

  /** Predicate indicating if video is paused. */
  this.isPaused = false;

  /** Predicate indicating if video was stopped. */
  this.isStopped = false;

  /** Predicate indicating if frame is animating. */
  this.isAnimating = false;

  /** Predicate indicating if player is fullscreen. */
  this.isFullscreen = false;

  /** Predicate indicating if player content is an image. */
  this.isImage = false;

  /** Predicate indicating if VR is enabled. */
  this.isVREnabled = false;

  /** Predicate indicating if a VR HMD is available. */
  this.isHMDAvailable = false;

  /** Predicate indicating if a VR HMD position sensor is available. */
  this.isHMDPositionSensorAvailable = false;

  /** Predicate indicating if player is resizable. */
  this.isResizable = false;

  /** Predicate indicating if mouse is down. */
  this.isMousedown = false;

  /** Predicate indicating if user is touching frame. */
  this.isTouching = false;

  /** Predicate indicating if VR is possible. */
  this.isVRPossible = false;

  /** Predicate indicating if source is cross origin. */
  this.isCrossOrigin = false;
}
