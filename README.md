
# `@grovekit/homie-core`

A [GroveKit] library that provides typings and utilities for working with the
[Homie MQTT convention] (v5).

It's very unlikely that you'll need to use this library directly. Instead, you
should use one of the higher-level libraries that build on top of it, such as
[@grovekit/homie-client].

## Table of Contents

- [Status](#status)
- [Installation](#installation)
- [Overview](#overview)
- [Topics](#topics)
- [Payloads](#payloads)
- [Formats](#formats)
- [Values](#values)
- [Enums](#enums)
- [Utilities](#utilities)
- [Building](#building)
- [Testing](#testing)
- [Author](#author)
- [License](#license)

## Status

The [GroveKit] stack is currently in development and is in a pre-alpha state.
Unless you are a developer interested in the [Homie MQTT convention], using
this library is not recommended.

## Installation

```sh
npm install @grovekit/homie-core
```

## Overview

This library provides the low-level building blocks for working with the
[Homie MQTT convention] (v5). It has no knowledge of MQTT itself — it deals
purely with types, topic parsing/serialization, value parsing/serialization,
and format definitions.

The main exports are:

- **`TOPIC`** — parse and serialize Homie MQTT topic strings
- **Topic types** — typed interfaces for all Homie topic types
- **Payload types** — typed interfaces for device, node, and property descriptions
- **Format types and parsers** — typed property format definitions and parsers
- **Value parsers and serializers** — convert between raw MQTT payloads and typed values
- **Enums** — `DEVICE_STATE`, `LOG_LEVEL`, `STRING`
- **Utilities** — auto-discovery topic generation, validation error formatting

## Topics

Homie v5 topics follow the structure `<prefix>/5/<device>/<attribute>`. This
library models all topic types as typed interfaces and provides parsing and
serialization via the `TOPIC` object.

### Parsing

```typescript
import { TOPIC } from '@grovekit/homie-core';

const parsed = TOPIC.parse('homie/5/mydevice/$state');
// → { type: 'device_state', prefix: 'homie', device: 'mydevice', raw: '...' }

const parsed = TOPIC.parse('homie/5/mydevice/sensors/temperature');
// → { type: 'property_value', prefix: 'homie', device: 'mydevice', node: 'sensors', property: 'temperature', raw: '...' }

const parsed = TOPIC.parse('homie/5/$broadcast/alert');
// → { type: 'broadcast', prefix: 'homie', subtopic: 'alert', raw: '...' }
```

### Serialization

```typescript
import { TOPIC } from '@grovekit/homie-core';

TOPIC.stringify({ type: 'device_state', prefix: 'homie', device: 'mydevice' });
// → 'homie/5/mydevice/$state'

TOPIC.stringify({ type: 'broadcast', prefix: 'homie', subtopic: 'security/alert' });
// → 'homie/5/$broadcast/security/alert'
```

### Topic Types

| Type                | Interface              | Example topic                                    |
| ------------------- | ---------------------- | ------------------------------------------------ |
| Device state        | `DeviceStateTopic`     | `homie/5/mydevice/$state`                        |
| Device description  | `DeviceInfoTopic`      | `homie/5/mydevice/$description`                  |
| Device log          | `DeviceLogTopic`       | `homie/5/mydevice/$log/warn`                     |
| Device alert        | `DeviceAlertTopic`     | `homie/5/mydevice/$alert/battery`                |
| Property value      | `PropertyValueTopic`   | `homie/5/mydevice/sensors/temperature`           |
| Property target     | `PropertyTargetTopic`  | `homie/5/mydevice/sensors/temperature/$target`   |
| Property set        | `PropertySetTopic`     | `homie/5/mydevice/sensors/temperature/set`       |
| Broadcast           | `BroadcastTopic`       | `homie/5/$broadcast/alert`                       |

All parsed topics include a `raw` field containing the original topic string
(via the `WithRaw<T>` utility type).

## Payloads

Typed interfaces for the JSON payloads used in Homie device descriptions:

- **`DeviceDescription`** — the `$description` JSON document, including
  `homie` version, `nodes`, `children`, `root`, `parent`, `extensions`, etc.
- **`NodeDescription`** — a node within a device description, with `name`,
  `type`, and `properties`.
- **`PropertyDescription`** — a property within a node description, with
  `datatype`, `format`, `settable`, `retained`, `unit`, etc.

## Formats

Property formats define constraints on property values. The `getPropertyFormat`
function parses a `PropertyDescription` into a typed format object:

```typescript
import { getPropertyFormat } from '@grovekit/homie-core';

getPropertyFormat({ datatype: 'integer', format: '0:100:2' });
// → { datatype: 'integer', min: 0, max: 100, step: 2 }

getPropertyFormat({ datatype: 'enum', format: 'off,low,high' });
// → { datatype: 'enum', values: ['off', 'low', 'high'] }

getPropertyFormat({ datatype: 'boolean', format: 'close,open' });
// → { datatype: 'boolean', values: ['close', 'open'] }

getPropertyFormat({ datatype: 'color', format: 'rgb,hsv' });
// → { datatype: 'color', formats: ['rgb', 'hsv'] }
```

### Format Types

| Datatype   | Interface         | Format string example   | Notes                                                  |
| ---------- | ----------------- | ----------------------- | ------------------------------------------------------ |
| `integer`  | `NumericFormat`   | `0:100:2`               | `[min]:[max][:step]`, open-ended allowed (e.g. `0:`)   |
| `float`    | `NumericFormat`   | `-20.5:120.5:0.1`       | Same as integer but with float values                  |
| `enum`     | `EnumFormat`      | `off,low,high`          | Comma-separated, required, at least one value          |
| `color`    | `ColorFormat`     | `rgb,hsv,xyz`           | Comma-separated, required, order = preference          |
| `boolean`  | `BooleanFormat`   | `close,open`            | Optional false/true labels (descriptive only)          |
| `string`   | `StringFormat`    |                         | No format options                                      |
| `datetime` | `DatetimeFormat`  |                         | No format options                                      |
| `duration` | `DurationFormat`  |                         | No format options                                      |
| `json`     | `JsonFormat`      |                         | Optional JSONschema string                             |

## Values

Functions for parsing raw MQTT payloads into typed values and serializing
typed values back into raw payloads.

### Parsing

```typescript
import { parseNumericValue, parseBooleanValue, parseColorValue } from '@grovekit/homie-core';

parseNumericValue('42', { datatype: 'integer' });
// → 42

parseBooleanValue('true', { datatype: 'boolean' });
// → true

parseColorValue('rgb,100,200,50');
// → ['rgb', 100, 200, 50]
```

All parse functions return `undefined` for invalid payloads.

### Serialization

```typescript
import { serializeNumericValue, serializeBooleanValue, serializeColorValue } from '@grovekit/homie-core';

serializeNumericValue(42, { datatype: 'integer', min: 0, max: 100 });
// → '42'

serializeBooleanValue(true, { datatype: 'boolean' });
// → 'true'

serializeColorValue(['rgb', 100, 200, 50], { datatype: 'color', formats: ['rgb'] });
// → 'rgb,100,200,50'
```

### Supported Datatypes

| Datatype   | Parse function          | Serialize function          | Value type           |
| ---------- | ----------------------- | --------------------------- | -------------------- |
| `string`   | passthrough             | passthrough                 | `string`             |
| `integer`  | `parseNumericValue`     | `serializeNumericValue`     | `number`             |
| `float`    | `parseNumericValue`     | `serializeNumericValue`     | `number`             |
| `boolean`  | `parseBooleanValue`     | `serializeBooleanValue`     | `boolean`            |
| `enum`     | `parseEnumValue`        | `serializeEnumValue`        | `string`             |
| `color`    | `parseColorValue`       | `serializeColorValue`       | `ColorValueType`     |
| `datetime` | `parseDatetimeValue`    | `serializeDatetimeValue`    | `Date`               |
| `duration` | `parseDurationValue`    | `serializeDurationValue`    | `string` (ISO 8601)  |
| `json`     | `parseJsonValue`        | `serializeJsonValue`        | `string` (JSON)      |

The `parseValue` and `serializeValue` functions dispatch to the appropriate
type-specific function based on the format's `datatype` field.

### Numeric Step Rounding

When serializing numeric values, the `serializeNumericValue` function applies
step-based rounding as specified by the Homie convention. The `roundToStep`
utility is also exported for direct use:

```typescript
import { roundToStep } from '@grovekit/homie-core';

roundToStep(5, { datatype: 'integer', min: 0, max: 10, step: 2 });
// → 6
```

Rounding uses `floor((value - base) / step + 0.5) * step + base` as
recommended by the spec, with the base determined by `min`, then `max`,
then the value itself. Min/max validation is applied after rounding.

## Enums

### `DEVICE_STATE`

```typescript
import { DEVICE_STATE } from '@grovekit/homie-core';

DEVICE_STATE.INIT          // 'init'
DEVICE_STATE.READY         // 'ready'
DEVICE_STATE.DISCONNECTED  // 'disconnected'
DEVICE_STATE.SLEEPING      // 'sleeping'
DEVICE_STATE.LOST          // 'lost'
```

### `LOG_LEVEL`

```typescript
import { LOG_LEVEL } from '@grovekit/homie-core';

LOG_LEVEL.DEBUG  // 'debug'
LOG_LEVEL.INFO   // 'info'
LOG_LEVEL.WARN   // 'warn'
LOG_LEVEL.ERROR  // 'error'
LOG_LEVEL.FATAL  // 'fatal'
```

### `STRING`

Constants for special MQTT payload values as defined by the Homie convention:

```typescript
import { STRING } from '@grovekit/homie-core';

STRING.NULL   // '' (empty string — MQTT topic deletion)
STRING.EMPTY  // '\x00' (null byte — represents an empty string value)
STRING.TRUE   // 'true'
STRING.FALSE  // 'false'
```

## Utilities

### Auto-Discovery

```typescript
import { getAutodiscoveryTopic } from '@grovekit/homie-core';

// Default cross-prefix discovery (per spec)
getAutodiscoveryTopic();
// → '+/5/+/$state'

// Prefix-specific discovery
getAutodiscoveryTopic('homie');
// → 'homie/5/+/$state'
```

### Device Wildcard

```typescript
import { getDeviceWildcardTopic } from '@grovekit/homie-core';

// From a parsed device state topic, get a wildcard for all device topics
getDeviceWildcardTopic(parsedDeviceStateTopic);
// → 'homie/5/mydevice/#'
```

## Building

```sh
npm run ts:build   # Clean build
npm run ts:watch   # Watch mode
npm run ts:clean   # Remove build artifacts
```

## Testing

```sh
npm run ts:build
npm test
```

## Author

Jacopo Scazzosi ([@jacoscaz])

## License

MIT. See [./LICENSE] file.

[GroveKit]: https://github.com/grovekit
[@jacoscaz]: https://github.com/jacoscaz
[./LICENSE]: https://github.com/grovekit/homie-core/tree/main/LICENSE
[Homie MQTT convention]: https://homieiot.github.io/
[@grovekit/homie-client]: https://github.com/grovekit/homie-client
