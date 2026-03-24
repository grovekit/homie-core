import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { getAutodiscoveryTopic } from './utils.js';

describe('Utils', () => {

  describe('getAutodiscoveryTopic', () => {

    it('should return a prefix-specific autodiscovery topic', () => {
      strictEqual(getAutodiscoveryTopic('homie'), 'homie/5/+/$state');
    });

    it('should return a prefix-specific autodiscovery topic with a custom prefix', () => {
      strictEqual(getAutodiscoveryTopic('myprefix'), 'myprefix/5/+/$state');
    });

    it('should return the default cross-prefix autodiscovery topic when no prefix is given', () => {
      strictEqual(getAutodiscoveryTopic(), '+/5/+/$state');
    });

  });

});