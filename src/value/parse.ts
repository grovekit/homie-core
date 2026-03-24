
import {
  ColorValueType,
  RawValue,
} from '../value/types.js';

import {
  BooleanFormat,
  EnumFormat,
  PropertyFormat,
  NumericFormat,
} from '../formats.js';

import { maybeParseNumber } from '../utils.js';

const DURATION_RE = /^PT(?=\d)(\d+(\.\d+)?H)?(\d+(\.\d+)?M)?(\d+(\.\d+)?S)?$/;

export const parseEnumValue = <F extends EnumFormat>(raw: RawValue, format: F): F['values'][number] | undefined => {
  if (format.values.includes(raw)) {
    return raw;
  }
  return undefined;
};

export const parseBooleanValue = (raw: RawValue, format: BooleanFormat): boolean | undefined => {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
};

export const parseNumericValue = (raw: RawValue, format: NumericFormat): number | undefined => {
  const parsed = maybeParseNumber(raw, format.datatype === 'integer' ? parseInt : parseFloat);
  return parsed;
};

export const parseColorValue = (raw: RawValue): ColorValueType | undefined => {
  const parts = raw.split(',');
  switch (parts[0]) {
    case 'rgb':
    case 'hsv': {
      if (parts.length !== 4) return undefined;
      const a = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      const c = parseFloat(parts[3]);
      if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) return undefined;
      return [parts[0], a, b, c];
    }
    case 'xyz': {
      if (parts.length !== 3) return undefined;
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      if (Number.isNaN(x) || Number.isNaN(y)) return undefined;
      return [parts[0], x, y];
    }
    default:
      return undefined;
  }
};

export const parseDurationValue = (raw: RawValue): string | undefined => {
  if (DURATION_RE.test(raw)) {
    return raw;
  }
  return undefined;
};

export const parseDatetimeValue = (raw: RawValue): Date | undefined => {
  const date = new Date(raw);
  if (!Number.isNaN(date.valueOf())) {
    return date;
  }
  return undefined;
};

export const parseValue = <F extends PropertyFormat>(raw: RawValue, format: F) => {
  switch (format.datatype) {
    case 'string':
      return raw as string;
    case 'boolean':
      return parseBooleanValue(raw, format);
    case 'integer':
    case 'float':
      return parseNumericValue(raw, format);
    case 'enum':
      return parseEnumValue(raw, format);
    case 'color':
      return parseColorValue(raw);
    case 'datetime':
      return parseDatetimeValue(raw);
    case 'duration':
      return parseDurationValue(raw);
    case 'json':
      return undefined;
  }
};
