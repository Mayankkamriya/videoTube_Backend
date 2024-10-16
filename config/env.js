'use strict';

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import paths from './paths.js';


const NODE_ENV = process.env.NODE_ENV || 'development';

const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  paths.dotenv,
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    dotenv.config({ path: dotenvFile });
  }
});

// Manually expand environment variables
for (const key in process.env) {
  if (process.env[key].startsWith('$')) {
    const varName = process.env[key].substring(1);
    process.env[key] = process.env[varName];
  }
}

// console.log(process.env);

export default process.env
