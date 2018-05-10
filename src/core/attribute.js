/* eslint-disable complexity */
import assert from '../utils/assert';
import {Buffer} from '../webgl';
import GL from '../constants';

export default class Attribute {
  constructor(gl, opts = {}) {
    const {
      id = 'unnamed-attribute',
      type,
      size = 1,
      isIndexed = false
    } = opts;

    // Options that cannot be changed later
    this.gl = gl;
    this.id = id;
    this.size = size;
    this.isIndexed = isIndexed;
    this.target = isIndexed ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER;
    this.type = type;

    // Initialize the attribute descriptor, with WebGL and metadata fields
    this.value = null;
    this.buffer = null;
    this.userData = {}; // Reserved for application
    this.update(opts);

    // Sanity - no app fields on our attributes. Use userData instead.
    Object.seal(this);

    // Check all fields and generate helpful error messages
    this._validateAttributeDefinition();
  }

  delete() {
    if (this.buffer) {
      this.buffer.delete();
      this.buffer = null;
    }
  }

  clone(opts) {
    return new this.constructor(this.gl, Object.assign({}, this, {
      value: this.getBuffer() || this.value
    }, opts));
  }

  update({
    value,

    // buffer options
    offset = this.offset || 0,
    stride = this.stride || 0,
    normalized = this.normalized || false,
    integer = this.integer || false,
    instanced = this.instanced || 0,

    isGeneric = this.isGeneric || false,
    isInstanced
  }) {

    this.offset = offset;
    this.stride = stride;
    this.normalized = normalized;
    this.integer = integer;
    this.isGeneric = isGeneric;

    if (isInstanced !== undefined) {
      this.instanced = isInstanced ? 1 : 0;
    } else {
      this.instanced = instanced;
    }

    if (value) {
      this.value = value;

      if (!(value instanceof Buffer) && !isGeneric) {
        // Create buffer if needed
        this.buffer = this.buffer || new Buffer(this.gl, {
          target: this.target,
          type: this.type
        });
        this.buffer.setData({data: value});
        this.type = this.type || this.buffer.type;
      }
    }
  }

  getBuffer() {
    if (this.isGeneric) {
      return null;
    }
    if (this.value instanceof Buffer) {
      return this.value;
    }
    return this.buffer;
  }

  _validateAttributeDefinition() {
    assert(
      this.size >= 1 && this.size <= 4,
      `Attribute definition for ${this.id} invalid size`
    );
  }
}
