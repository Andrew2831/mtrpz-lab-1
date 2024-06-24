import * as fs from 'fs';
import { CannotReadFileException } from './cannotReadFileExceptions.js';
import { WrongSyntaxException } from './wrongSyntaxException.js';
import { handleErrorSync } from '@stlib/utils';

export class Converter {
  constructor(inputFile, outputFile) {
    this.mdFile = inputFile;
    this.htmlFile = outputFile;
    this.preformattedText = [];
  }

  #patterns = [
    { regexp: /(?<=[ ,.:;\n\t]|^)\*\*(?=\S)(.+?)(?<=\S)\*\*(?=[ ,.:;\n\t]|$)/g, html: '<b>$1</b>' },
    { regexp: /(?<=[ ,.:;\n\t]|^)_(?=\S)(.+?)(?<=\S)_(?=[ ,.:;\n\t]|$)/g, html: '<i>$1</i>' },
    { regexp: /(?<=[ ,.:;\n\t]|^)`(?=\S)(.+?)(?=\S)`(?=[ ,.:;\n\t]|$)/g, html: '<tt>$1</tt>' },
    { regexp: /(?<=^|[\n])#{5}\s*(.+?)(?=\s|$)/g, html: '<h5>$1</h5>' },
    { regexp: /(?<=^|[\n])#{4}\s*(.+?)(?=\s|$)/g, html: '<h4>$1</h4>' },
    { regexp: /(?<=^|[\n])#{3}\s*(.+?)(?=\s|$)/g, html: '<h3>$1</h3>' },
    { regexp: /(?<=^|[\n])#{2}\s*(.+?)(?=\s|$)/g, html: '<h2>$1</h2>' },
    { regexp: /(?<=^|[\n])#{1}\s*(.+?)(?=\s|$)/g, html: '<h1>$1</h1>' },
  ];

  convert() {
    fs.readFile(this.mdFile, 'utf8', (err, data) => {
      if (err) {
        handleErrorSync(new CannotReadFileException());
      }

      try {
        this.validateSyntax(data);
        const formattedText = this.getPreformattedText(data);
        const html = this.applyPatterns(formattedText);
        const paragraphs = this.formatParagraphs(html);
        const result = this.insertPreformattedText(paragraphs);

        this.outputResult(result);
      } catch (e) {
        handleErrorSync(e);
      }
    });
  }

  validateSyntax(data) {
    const lines = data.split('\n');
    for (const line of lines) {
      if (line.startsWith('_') && !line.endsWith('_') && !line.startsWith('_ ')) {
        throw new WrongSyntaxException(line);
      } else if (/\*\*`_([^`]+?)_`\*\*/.test(line)) {
        throw new WrongSyntaxException(line);
      }
    }
  }

  getPreformattedText(text) {
    const preformattedPattern = /```([\s\S]*?)```/g;
    const preformattedText = text.match(preformattedPattern) || [];

    this.preformattedText.push(...preformattedText);
    return preformattedText.reduce((prev, cur, curIndex) => {
      return prev.replace(cur, `PRE{{${curIndex}}}PRE`);
    }, text);
  }

  insertPreformattedText(text) {
    return this.preformattedText.reduce((prev, cur, curIndex) => {
      const html = `<pre>${cur.replace(/```/g, '')}</pre>`;
      return prev.replace(`PRE{{${curIndex}}}PRE`, html);
    }, text);
  }

  applyPatterns(text) {
    return this.#patterns.reduce((prev, cur) => {
      return prev.replace(cur.regexp, cur.html);
    }, text);
  }

  formatParagraphs(text) {
    return text.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('\n');
  }

  outputResult(result) {
    if (this.htmlFile) {
      fs.writeFileSync(this.htmlFile, result);
    } else {
      console.log(result);
    }
  }
}
