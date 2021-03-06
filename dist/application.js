"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.
const resolve = require('path').resolve;

const assert = require('assert');

const send = require('koa-send');

module.exports = function () {
  let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(function* (_ref) {
        let {
          httpProxy
        } = _ref;
        assert(opts.urlPrefix, 'urlPrefix is required to serve files');
        assert(opts.root, 'root directory is required to serve files');
        opts.root = resolve(opts.root);
        if (opts.index !== false) opts.index = opts.index || 'index.html';

        if (!opts.defer) {
          httpProxy.use(
          /*#__PURE__*/
          function () {
            var _ref3 = _asyncToGenerator(function* (ctx, next) {
              const urlPath = ctx.path;

              if (urlPath.startsWith(opts.urlPrefix)) {
                let done = false;

                if (ctx.method === 'HEAD' || ctx.method === 'GET') {
                  try {
                    done = yield send(ctx, urlPath.replace(opts.urlPrefix, ''), opts);
                  } catch (err) {
                    if (err.status !== 404) {
                      throw err;
                    }
                  }
                }

                if (!done) {
                  yield next();
                }
              } else {
                yield next();
              }
            });

            return function (_x2, _x3) {
              return _ref3.apply(this, arguments);
            };
          }());
        } else {
          httpProxy.use(
          /*#__PURE__*/
          function () {
            var _ref4 = _asyncToGenerator(function* (ctx, next) {
              yield next();
              const urlPath = ctx.path;

              if (urlPath.startsWith(opts.urlPrefix)) {
                if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return;
                if (ctx.body != null || ctx.status !== 404) return;

                try {
                  yield send(ctx, urlPath.replace(opts.urlPrefix, ''), opts);
                } catch (err) {
                  if (err.status !== 404) {
                    throw err;
                  }
                }
              }
            });

            return function (_x4, _x5) {
              return _ref4.apply(this, arguments);
            };
          }());
        }
      });

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
};