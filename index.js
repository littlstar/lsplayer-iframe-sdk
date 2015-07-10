
/**
 * Module dependencies.
 */

var rpc = require('littlstar/frame-rpc@master')
  , merge = require('yields/merge')
  , Emitter = require('component/emitter')
  , domready = require('components/domready')

const GLOBAL_CALLBACK_NAME = 'OnLSPlayerFrameReady';
const IFRAME_CLASS_NAME = 'lsplayer-frame';

var FRAME_COUNT = 0;

// initialize when DOM s ready
domready(InitializeFrameRPC);

/**
 * Initializes the iframe SDK.
 * The GLOBAL_CALLBACK_NAME is called when
 * the state is ready and communication between
 * the frames have been established.
 *
 * @public
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
  this.id = FRAME_COUNT++;
  this.gateway = null;
  this.iframe = iframe;
  this.state = new LSPlayerState();
  this.src = new window.URL(iframe.getAttribute('src'));
  this.origin = this.src.protocol + '//' + this.src.host;

  this.on('state', function (data) {
    // update state object when state is emitted
    merge(self.state, data);
  });

  this.iframe.addEventListener('load', function () {
    window.gateway = self.gateway = rpc(window, iframe.contentWindow, self.origin, {
      emit: function (event, data, cb) {
        self.emit(event, data);
        cb();
      }
    });

    self.gateway.call('initialize', function () {
      window[GLOBAL_CALLBACK_NAME](self, self.state);
    });
  });
}

// inherit `EventEmitter'
Emitter(LSPlayerRPC.prototype);

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
}


