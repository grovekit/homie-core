import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual, throws } from 'node:assert';
import {
  getNumericPropertyFormat,
  getEnumPropertyFormat,
  getBooleanPropertyFormat,
  getColorPropertyFormat,
  getPropertyFormat,
} from './formats.js';

describe('Formats', () => {

  describe('getNumericPropertyFormat', () => {

    it('should return a bare format when no format string is provided', () => {
      const format = getNumericPropertyFormat('integer', undefined, parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, undefined);
      strictEqual(format.max, undefined);
      strictEqual(format.step, undefined);
    });

    it('should parse a full integer format', () => {
      const format = getNumericPropertyFormat('integer', '0:100:2', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, 0);
      strictEqual(format.max, 100);
      strictEqual(format.step, 2);
    });

    it('should parse a full float format', () => {
      const format = getNumericPropertyFormat('float', '-20.5:120.5:0.1', parseFloat);
      strictEqual(format.datatype, 'float');
      strictEqual(format.min, -20.5);
      strictEqual(format.max, 120.5);
      strictEqual(format.step, 0.1);
    });

    it('should parse an open-ended min format (e.g. ":10")', () => {
      const format = getNumericPropertyFormat('integer', ':10', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, undefined);
      strictEqual(format.max, 10);
      strictEqual(format.step, undefined);
    });

    it('should parse an open-ended max format (e.g. "0:")', () => {
      const format = getNumericPropertyFormat('integer', '0:', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, 0);
      strictEqual(format.max, undefined);
      strictEqual(format.step, undefined);
    });

    it('should parse a fully open-ended format (e.g. ":")', () => {
      const format = getNumericPropertyFormat('integer', ':', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, undefined);
      strictEqual(format.max, undefined);
      strictEqual(format.step, undefined);
    });

    it('should parse an open-ended format with step (e.g. "::5")', () => {
      const format = getNumericPropertyFormat('integer', '::5', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, undefined);
      strictEqual(format.max, undefined);
      strictEqual(format.step, 5);
    });

    it('should parse min-only format (e.g. "5")', () => {
      const format = getNumericPropertyFormat('integer', '5', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, 5);
      strictEqual(format.max, undefined);
      strictEqual(format.step, undefined);
    });

    it('should parse negative bounds', () => {
      const format = getNumericPropertyFormat('integer', '-100:100', parseInt);
      strictEqual(format.datatype, 'integer');
      strictEqual(format.min, -100);
      strictEqual(format.max, 100);
      strictEqual(format.step, undefined);
    });

  });

  describe('getEnumPropertyFormat', () => {

    it('should parse a single-value enum format', () => {
      const format = getEnumPropertyFormat('enum', 'value1');
      strictEqual(format.datatype, 'enum');
      deepStrictEqual(format.values, ['value1']);
    });

    it('should parse a multi-value enum format', () => {
      const format = getEnumPropertyFormat('enum', 'off,low,medium,high');
      strictEqual(format.datatype, 'enum');
      deepStrictEqual(format.values, ['off', 'low', 'medium', 'high']);
    });

    it('should throw on undefined format', () => {
      throws(() => getEnumPropertyFormat('enum', undefined));
    });

    it('should throw on empty format string', () => {
      throws(() => getEnumPropertyFormat('enum', ''));
    });

  });

  describe('getBooleanPropertyFormat', () => {

    it('should return a bare format when no format string is provided', () => {
      const format = getBooleanPropertyFormat('boolean', undefined);
      strictEqual(format.datatype, 'boolean');
      strictEqual(format.values, undefined);
    });

    it('should parse custom false/true labels', () => {
      const format = getBooleanPropertyFormat('boolean', 'close,open');
      strictEqual(format.datatype, 'boolean');
      deepStrictEqual(format.values, ['close', 'open']);
    });

    it('should return a bare format if only one label is provided', () => {
      const format = getBooleanPropertyFormat('boolean', 'close');
      strictEqual(format.datatype, 'boolean');
      strictEqual(format.values, undefined);
    });

    it('should return a bare format on empty string', () => {
      const format = getBooleanPropertyFormat('boolean', '');
      strictEqual(format.datatype, 'boolean');
      strictEqual(format.values, undefined);
    });

  });

  describe('getColorPropertyFormat', () => {

    it('should parse a single color format', () => {
      const format = getColorPropertyFormat('color', 'rgb');
      strictEqual(format.datatype, 'color');
      deepStrictEqual(format.formats, ['rgb']);
    });

    it('should parse multiple color formats in preference order', () => {
      const format = getColorPropertyFormat('color', 'rgb,hsv,xyz');
      strictEqual(format.datatype, 'color');
      deepStrictEqual(format.formats, ['rgb', 'hsv', 'xyz']);
    });

    it('should filter out invalid color format values', () => {
      const format = getColorPropertyFormat('color', 'rgb,invalid,hsv');
      strictEqual(format.datatype, 'color');
      deepStrictEqual(format.formats, ['rgb', 'hsv']);
    });

    it('should throw on undefined format', () => {
      throws(() => getColorPropertyFormat('color', undefined));
    });

  });

  describe('getPropertyFormat', () => {

    it('should dispatch to integer format parsing', () => {
      const format = getPropertyFormat({ datatype: 'integer', format: '0:100:2' });
      strictEqual(format.datatype, 'integer');
      if (format.datatype !== 'integer') throw new Error('unexpected');
      strictEqual(format.min, 0);
      strictEqual(format.max, 100);
      strictEqual(format.step, 2);
    });

    it('should dispatch to float format parsing', () => {
      const format = getPropertyFormat({ datatype: 'float', format: '0.5:99.5' });
      strictEqual(format.datatype, 'float');
      if (format.datatype !== 'float') throw new Error('unexpected');
      strictEqual(format.min, 0.5);
      strictEqual(format.max, 99.5);
    });

    it('should dispatch to enum format parsing', () => {
      const format = getPropertyFormat({ datatype: 'enum', format: 'a,b,c' });
      strictEqual(format.datatype, 'enum');
      if (format.datatype !== 'enum') throw new Error('unexpected');
      deepStrictEqual(format.values, ['a', 'b', 'c']);
    });

    it('should dispatch to boolean format parsing', () => {
      const format = getPropertyFormat({ datatype: 'boolean', format: 'off,on' });
      strictEqual(format.datatype, 'boolean');
      if (format.datatype !== 'boolean') throw new Error('unexpected');
      deepStrictEqual(format.values, ['off', 'on']);
    });

    it('should dispatch to color format parsing', () => {
      const format = getPropertyFormat({ datatype: 'color', format: 'rgb,hsv' });
      strictEqual(format.datatype, 'color');
      if (format.datatype !== 'color') throw new Error('unexpected');
      deepStrictEqual(format.formats, ['rgb', 'hsv']);
    });

    it('should return a bare format for string', () => {
      const format = getPropertyFormat({ datatype: 'string' });
      strictEqual(format.datatype, 'string');
    });

    it('should return a bare format for datetime', () => {
      const format = getPropertyFormat({ datatype: 'datetime' });
      strictEqual(format.datatype, 'datetime');
    });

    it('should return a bare format for duration', () => {
      const format = getPropertyFormat({ datatype: 'duration' });
      strictEqual(format.datatype, 'duration');
    });

    it('should return a bare format for json', () => {
      const format = getPropertyFormat({ datatype: 'json' });
      strictEqual(format.datatype, 'json');
    });

  });

});