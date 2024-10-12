'use strict';
// const { createHash } = require('crypto');
import { createHash } from 'crypto';

// module.exports = env => {
  const generateHash = (env) => {


  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};

export default generateHash;