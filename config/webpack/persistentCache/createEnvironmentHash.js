'use strict';
import { createHash } from 'crypto';

  const generateHash = (env) => {


  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};

export default generateHash;