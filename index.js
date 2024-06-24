import { options } from "@stlib/utils";

if(options.help) {
  console.log('Usage: node index.js --file <input file> [--out <output file>]\ninput file: Markdown sytax\noutput file: HTML syntax');
  process.exit(0);
}

if(!options.file) {
  console.error('No input file provided.');
  process.exit(1);
}

import { Converter } from './converterClass.js'

new Converter(options.file, options.out).convert();
