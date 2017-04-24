/**
 * Copyright(c) cnpm and other contributors.
 * MIT Licensed
 *
 * Authors:
 *  dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *  fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

const oss = require('ali-oss');

exports.create = function (options) {
  return new OssWrapper(options);
};

function OssWrapper(options) {
  // If you want to use oss public mode, please set `options.mode = 'public'`
  this._mode = options.mode === 'public' ? 'public' : 'private';
  this._prefix = options.prefix || '';

  if (options.cluster) {
    options.schedule = options.schedule || 'masterSlave';
    this.client = new oss.ClusterClient(options);
  } else {
    this.client = oss(options);
  }

  this._cdnBaseUrl = options.cdnBaseUrl;
  this._defaultHeaders = options.defaultHeaders;
  this._trimKey = trimKey.bind(null, this._prefix);
}

const proto = OssWrapper.prototype;

proto.upload = function* (filePath, options) {
  const key = this._trimKey(options.key);
  // https://github.com/ali-sdk/ali-oss#putname-file-options
  const result = yield this.client.put(key, filePath, {
    headers: this._defaultHeaders,
  });
  if (this._mode === 'public') {
    return { url: result.url };
  }
  return { key: key };
};

proto.uploadBuffer = proto.upload;

proto.download = function* (key, filepath, options) {
  yield this.client.get(this._trimKey(key), filepath, options);
};

proto.createDownloadStream = function* (key, options) {
  return (yield this.client.getStream(this._trimKey(key), options)).stream;
};

proto.url = function (key) {
  const name = this._trimKey(key);
  if (this._cdnBaseUrl) {
    return this.client.getObjectUrl(name, this._cdnBaseUrl);
  }
  return this.client.signatureUrl(name);
};

proto.remove = function* (key) {
  yield this.client.delete(this._trimKey(key));
};

function trimKey(prefix, key) {
  console.log(object);
  return prefix + key ? key.replace(/^\//, '') : '';
}
