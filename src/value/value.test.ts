import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { RawValue } from './types.js';
import {
  parseColorValue,
  parseBooleanValue,
  parseNumericValue,
  parseEnumValue,
  parseDatetimeValue,
  parseDurationValue,
} from './parse.js';
import {
  serializeColorValue,
  serializeBooleanValue,
  serializeNumericValue,
  serializeEnumValue,
  serializeDatetimeValue,
  serializeDurationValue,
} from './serialize.js';
import {
  BooleanFormat,
  NumericFormat,
  EnumFormat,
  ColorFormat,
  DatetimeFormat,
  DurationFormat,
} from '../formats.js';

const raw = (value: string) => value as RawValue;

describe('Value', () => {

  describe('parseColorValue', () => {

    it('should parse an rgb color value', () => {
      const result = parseColorValue(raw('rgb,100,200,50'));
      deepStrictEqual(result, ['rgb', 100, 200, 50]);
    });

    it('should parse an rgb color value with floats', () => {
      const result = parseColorValue(raw('rgb,100.5,200.3,50.1'));
      deepStrictEqual(result, ['rgb', 100.5, 200.3, 50.1]);
    });

    it('should parse an rgb color value with zeros', () => {
      const result = parseColorValue(raw('rgb,0,0,0'));
      deepStrictEqual(result, ['rgb', 0, 0, 0]);
    });

    it('should parse an hsv color value', () => {
      const result = parseColorValue(raw('hsv,300,50,75'));
      deepStrictEqual(result, ['hsv', 300, 50, 75]);
    });

    it('should parse an hsv color value with floats', () => {
      const result = parseColorValue(raw('hsv,300.5,50.5,75.5'));
      deepStrictEqual(result, ['hsv', 300.5, 50.5, 75.5]);
    });

    it('should parse an xyz color value', () => {
      const result = parseColorValue(raw('xyz,0.25,0.34'));
      deepStrictEqual(result, ['xyz', 0.25, 0.34]);
    });

    it('should parse an xyz color value with zeros', () => {
      const result = parseColorValue(raw('xyz,0,0'));
      deepStrictEqual(result, ['xyz', 0, 0]);
    });

    it('should return undefined for an unrecognized color type', () => {
      strictEqual(parseColorValue(raw('cmyk,0,0,0,0')), undefined);
    });

    it('should return undefined for an empty string', () => {
      strictEqual(parseColorValue(raw('')), undefined);
    });

    it('should return undefined for rgb with too few parts', () => {
      strictEqual(parseColorValue(raw('rgb,100,200')), undefined);
    });

    it('should return undefined for rgb with too many parts', () => {
      strictEqual(parseColorValue(raw('rgb,100,200,50,99')), undefined);
    });

    it('should return undefined for hsv with too few parts', () => {
      strictEqual(parseColorValue(raw('hsv,300,50')), undefined);
    });

    it('should return undefined for xyz with too few parts', () => {
      strictEqual(parseColorValue(raw('xyz,0.25')), undefined);
    });

    it('should return undefined for xyz with too many parts', () => {
      strictEqual(parseColorValue(raw('xyz,0.25,0.34,0.41')), undefined);
    });

    it('should return undefined for rgb with non-numeric values', () => {
      strictEqual(parseColorValue(raw('rgb,abc,200,50')), undefined);
    });

    it('should return undefined for rgb with an empty numeric part', () => {
      strictEqual(parseColorValue(raw('rgb,,200,50')), undefined);
    });

    it('should return undefined for xyz with non-numeric values', () => {
      strictEqual(parseColorValue(raw('xyz,abc,0.34')), undefined);
    });

    it('should return actual numbers, not strings', () => {
      const result = parseColorValue(raw('rgb,100,200,50'));
      if (!result) throw new Error('expected a result');
      strictEqual(typeof result[1], 'number');
      strictEqual(typeof result[2], 'number');
      strictEqual(typeof result[3], 'number');
    });

  });

  describe('serializeColorValue', () => {

    it('should serialize an rgb color value', () => {
      strictEqual(serializeColorValue(['rgb', 100, 200, 50], { datatype: 'color', formats: ['rgb'] }), 'rgb,100,200,50');
    });

    it('should serialize an hsv color value', () => {
      strictEqual(serializeColorValue(['hsv', 300, 50, 75], { datatype: 'color', formats: ['hsv'] }), 'hsv,300,50,75');
    });

    it('should serialize an xyz color value', () => {
      strictEqual(serializeColorValue(['xyz', 0.25, 0.34], { datatype: 'color', formats: ['xyz'] }), 'xyz,0.25,0.34');
    });

    it('should return undefined for non-array values', () => {
      strictEqual(serializeColorValue('not-an-array', { datatype: 'color', formats: ['rgb'] }), undefined);
    });

  });

  describe('parseBooleanValue', () => {

    const format: BooleanFormat = { datatype: 'boolean' };

    it('should parse "true"', () => {
      strictEqual(parseBooleanValue(raw('true'), format), true);
    });

    it('should parse "false"', () => {
      strictEqual(parseBooleanValue(raw('false'), format), false);
    });

    it('should return undefined for "TRUE" (case sensitive)', () => {
      strictEqual(parseBooleanValue(raw('TRUE'), format), undefined);
    });

    it('should return undefined for "FALSE" (case sensitive)', () => {
      strictEqual(parseBooleanValue(raw('FALSE'), format), undefined);
    });

    it('should return undefined for arbitrary strings', () => {
      strictEqual(parseBooleanValue(raw('yes'), format), undefined);
    });

    it('should return undefined for empty string', () => {
      strictEqual(parseBooleanValue(raw(''), format), undefined);
    });

  });

  describe('serializeBooleanValue', () => {

    const format: BooleanFormat = { datatype: 'boolean' };

    it('should serialize true', () => {
      strictEqual(serializeBooleanValue(true, format), 'true');
    });

    it('should serialize false', () => {
      strictEqual(serializeBooleanValue(false, format), 'false');
    });

  });

  describe('parseNumericValue', () => {

    const intFormat: NumericFormat = { datatype: 'integer' };
    const floatFormat: NumericFormat = { datatype: 'float' };

    it('should parse an integer', () => {
      strictEqual(parseNumericValue(raw('42'), intFormat), 42);
    });

    it('should parse a negative integer', () => {
      strictEqual(parseNumericValue(raw('-7'), intFormat), -7);
    });

    it('should parse zero', () => {
      strictEqual(parseNumericValue(raw('0'), intFormat), 0);
    });

    it('should parse a float', () => {
      strictEqual(parseNumericValue(raw('3.14'), floatFormat), 3.14);
    });

    it('should parse a negative float', () => {
      strictEqual(parseNumericValue(raw('-0.5'), floatFormat), -0.5);
    });

    it('should return undefined for non-numeric strings', () => {
      strictEqual(parseNumericValue(raw('abc'), intFormat), undefined);
    });

    it('should return undefined for empty string', () => {
      strictEqual(parseNumericValue(raw(''), intFormat), undefined);
    });

  });

  describe('serializeNumericValue', () => {

    const intFormat: NumericFormat = { datatype: 'integer', min: 0, max: 100 };
    const floatFormat: NumericFormat = { datatype: 'float' };

    it('should serialize an integer', () => {
      strictEqual(serializeNumericValue(42, intFormat), '42');
    });

    it('should serialize a float', () => {
      strictEqual(serializeNumericValue(3.14, floatFormat), '3.14');
    });

    it('should serialize a string-encoded integer', () => {
      strictEqual(serializeNumericValue('42', intFormat), '42');
    });

    it('should serialize a string-encoded float', () => {
      strictEqual(serializeNumericValue('3.14', floatFormat), '3.14');
    });

  });

  describe('parseEnumValue', () => {

    const format: EnumFormat = { datatype: 'enum', values: ['off', 'low', 'high'] };

    it('should parse a valid enum value', () => {
      strictEqual(parseEnumValue(raw('off'), format), 'off');
    });

    it('should parse another valid enum value', () => {
      strictEqual(parseEnumValue(raw('high'), format), 'high');
    });

    it('should return undefined for an invalid enum value', () => {
      strictEqual(parseEnumValue(raw('medium'), format), undefined);
    });

    it('should be case sensitive', () => {
      strictEqual(parseEnumValue(raw('Off'), format), undefined);
    });

    it('should return undefined for empty string', () => {
      strictEqual(parseEnumValue(raw(''), format), undefined);
    });

  });

  describe('serializeEnumValue', () => {

    const format: EnumFormat = { datatype: 'enum', values: ['off', 'low', 'high'] };

    it('should serialize a valid enum value', () => {
      strictEqual(serializeEnumValue('off', format), 'off');
    });

  });

  describe('parseDatetimeValue', () => {

    it('should parse an ISO 8601 datetime', () => {
      const result = parseDatetimeValue(raw('2025-06-15T12:00:00.000Z'));
      strictEqual(result instanceof Date, true);
      strictEqual(result!.toISOString(), '2025-06-15T12:00:00.000Z');
    });

    it('should return undefined for an invalid datetime', () => {
      strictEqual(parseDatetimeValue(raw('not-a-date')), undefined);
    });

    it('should return undefined for an empty string', () => {
      strictEqual(parseDatetimeValue(raw('')), undefined);
    });

  });

  describe('serializeDatetimeValue', () => {

    const format: DatetimeFormat = { datatype: 'datetime' };

    it('should serialize a Date to ISO 8601', () => {
      const date = new Date('2025-06-15T12:00:00.000Z');
      strictEqual(serializeDatetimeValue(date, format), '2025-06-15T12:00:00.000Z');
    });

  });

  describe('color roundtrip', () => {

    const format: ColorFormat = { datatype: 'color', formats: ['rgb', 'hsv', 'xyz'] };

    it('should roundtrip an rgb value', () => {
      const parsed = parseColorValue(raw('rgb,100,200,50'));
      const serialized = serializeColorValue(parsed, format);
      strictEqual(serialized, 'rgb,100,200,50');
    });

    it('should roundtrip an hsv value', () => {
      const parsed = parseColorValue(raw('hsv,300,50,75'));
      const serialized = serializeColorValue(parsed, format);
      strictEqual(serialized, 'hsv,300,50,75');
    });

    it('should roundtrip an xyz value', () => {
      const parsed = parseColorValue(raw('xyz,0.25,0.34'));
      const serialized = serializeColorValue(parsed, format);
      strictEqual(serialized, 'xyz,0.25,0.34');
    });

  });

  describe('parseDurationValue', () => {

      it('should parse a full duration with hours, minutes, and seconds', () => {
        strictEqual(parseDurationValue(raw('PT12H5M46S')), 'PT12H5M46S');
      });

      it('should parse a duration with only hours', () => {
        strictEqual(parseDurationValue(raw('PT3H')), 'PT3H');
      });

      it('should parse a duration with only minutes', () => {
        strictEqual(parseDurationValue(raw('PT5M')), 'PT5M');
      });

      it('should parse a duration with only seconds', () => {
        strictEqual(parseDurationValue(raw('PT30S')), 'PT30S');
      });

      it('should parse a duration with hours and minutes', () => {
        strictEqual(parseDurationValue(raw('PT1H30M')), 'PT1H30M');
      });

      it('should parse a duration with hours and seconds', () => {
        strictEqual(parseDurationValue(raw('PT1H30S')), 'PT1H30S');
      });

      it('should parse a duration with minutes and seconds', () => {
        strictEqual(parseDurationValue(raw('PT5M30S')), 'PT5M30S');
      });

      it('should parse a duration with decimal seconds', () => {
        strictEqual(parseDurationValue(raw('PT1.5S')), 'PT1.5S');
      });

      it('should parse a duration with decimal hours', () => {
        strictEqual(parseDurationValue(raw('PT1.5H')), 'PT1.5H');
      });

      it('should parse a duration with decimal minutes', () => {
        strictEqual(parseDurationValue(raw('PT1.5M')), 'PT1.5M');
      });

      it('should return undefined for an empty string', () => {
        strictEqual(parseDurationValue(raw('')), undefined);
      });

      it('should return undefined for just "PT"', () => {
        strictEqual(parseDurationValue(raw('PT')), undefined);
      });

      it('should return undefined for missing PT prefix', () => {
        strictEqual(parseDurationValue(raw('12H5M46S')), undefined);
      });

      it('should return undefined for arbitrary strings', () => {
        strictEqual(parseDurationValue(raw('not-a-duration')), undefined);
      });

      it('should return undefined for components in wrong order', () => {
        strictEqual(parseDurationValue(raw('PT5M12H')), undefined);
      });

      it('should return undefined for negative values', () => {
        strictEqual(parseDurationValue(raw('PT-5M')), undefined);
      });

    });

  describe('serializeDurationValue', () => {

    const format: DurationFormat = { datatype: 'duration' };

    it('should serialize a valid duration string', () => {
      strictEqual(serializeDurationValue('PT12H5M46S', format), 'PT12H5M46S');
    });

    it('should serialize a duration with only minutes', () => {
      strictEqual(serializeDurationValue('PT5M', format), 'PT5M');
    });

    it('should serialize a duration with decimal seconds', () => {
      strictEqual(serializeDurationValue('PT1.5S', format), 'PT1.5S');
    });

  });

  describe('duration roundtrip', () => {

    const format: DurationFormat = { datatype: 'duration' };

    it('should roundtrip a full duration', () => {
      const parsed = parseDurationValue(raw('PT12H5M46S'));
      strictEqual(parsed, 'PT12H5M46S');
      strictEqual(serializeDurationValue(parsed, format), 'PT12H5M46S');
    });

    it('should roundtrip a duration with decimals', () => {
      const parsed = parseDurationValue(raw('PT1.5S'));
      strictEqual(parsed, 'PT1.5S');
      strictEqual(serializeDurationValue(parsed, format), 'PT1.5S');
    });

  });

});