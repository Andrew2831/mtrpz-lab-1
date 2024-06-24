import { jest } from '@jest/globals'
import fs from 'fs';
import { Converter } from './converterClass';
import { WrongSytaxException } from './wrondSyntaxException';

describe('Converter', () => {
  const inputFilePath = 'input_test.md';
  const outputFilePath = 'output_test.html';

  beforeEach(() => {
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
    if (fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
    if (fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
  });

  describe('validateSyntax', () => {
    it('should throw WrongSyntaxException for invalid syntax', () => {
      const invalidMd = '_invalid syntax';
      const converter = new Converter(inputFilePath, outputFilePath);

      expect(() => converter.validateSyntax(invalidMd)).toThrow(WrongSytaxException);
    });
  });

  describe('getPreformattedText', () => {
    it('should extract preformatted text and replace with placeholders', () => {
      const text = 'Some text\n```\ncode block\n```\nMore text';
      const converter = new Converter(inputFilePath, outputFilePath);
      const result = converter.getPreformattedText(text);

      expect(result).toBe('Some text\nPRE{{0}}PRE\nMore text');
      expect(converter.preformattedText).toEqual(['```\ncode block\n```']);
    });
  });

  describe('insertPreformattedText', () => {
    it('should insert preformatted text back into placeholders', () => {
      const text = 'Some text\nPRE{{0}}PRE\nMore text';
      const converter = new Converter(inputFilePath, outputFilePath);
      converter.preformattedText = ['```\ncode block\n```'];
      const result = converter.insertPreformattedText(text);

      expect(result).toBe('Some text\n<pre>\ncode block\n</pre>\nMore text');
    });
  });

  describe('applyPatterns', () => {
    it('should apply markdown patterns to text', () => {
      const text = '**bold** _italic_ `code`';
      const converter = new Converter(inputFilePath, outputFilePath);
      const result = converter.applyPatterns(text);

      expect(result).toBe('<b>bold</b> <i>italic</i> <tt>code</tt>');
    });
  });

  describe('formatParagraphs', () => {
    it('should wrap text in paragraph tags', () => {
      const text = 'Paragraph 1\n\nParagraph 2';
      const converter = new Converter(inputFilePath, outputFilePath);
      const result = converter.formatParagraphs(text);

      expect(result).toBe('<p>Paragraph 1</p>\n<p>Paragraph 2</p>');
    });
  });

  describe('outputResult', () => {
    it('should write result to output file if specified', () => {
      const result = '<h1>Title</h1>';
      const converter = new Converter(inputFilePath, outputFilePath);
      converter.outputResult(result);

      const output = fs.readFileSync(outputFilePath, 'utf8');
      expect(output).toBe(result);
    });

    it('should log result to console if no output file specified', () => {
      console.log = jest.fn();
      const converter = new Converter(inputFilePath, null);
      const result = '<h1>Title</h1>';
      converter.outputResult(result);

      expect(console.log).toHaveBeenCalledWith(result);
    });
  });

  it('bad test', () => {
    expect('string').toBe(typeof number);
  })
});
