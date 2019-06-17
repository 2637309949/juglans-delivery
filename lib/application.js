// Copyright (c) 2018-2020 Double.  All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

const resolve = require('path').resolve
const assert = require('assert')
const send = require('koa-send')

module.exports = (opts = {}) => async function ({ httpProxy }) {
  assert(opts.urlPrefix, 'urlPrefix is required to serve files')
  assert(opts.root, 'root directory is required to serve files')
  opts.root = resolve(opts.root)
  if (opts.index !== false) opts.index = opts.index || 'index.html'
  if (!opts.defer) {
    httpProxy.use(async function (ctx, next) {
      const urlPath = ctx.path
      if (urlPath.startsWith(opts.urlPrefix)) {
        let done = false
        if (ctx.method === 'HEAD' || ctx.method === 'GET') {
          try {
            done = await send(ctx, urlPath.replace(opts.urlPrefix, ''), opts)
          } catch (err) {
            if (err.status !== 404) {
              throw err
            }
          }
        }
        if (!done) {
          await next()
        }
      } else {
        await next()
      }
    })
  } else {
    httpProxy.use(async function (ctx, next) {
      await next()
      const urlPath = ctx.path
      if (urlPath.startsWith(opts.urlPrefix)) {
        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return
        if (ctx.body != null || ctx.status !== 404) return
        try {
          await send(ctx, urlPath.replace(opts.urlPrefix, ''), opts)
        } catch (err) {
          if (err.status !== 404) {
            throw err
          }
        }
      }
    })
  }
}
