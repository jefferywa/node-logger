import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { OutputRecordInterface } from './interfaces/output-record.interface';
import {
  runBaselineScenario,
  runExceptionResponseScenario,
  runSuccessfulShortResponseScenario,
  runSuccessfulResponseScenario,
} from './utils/logger-scenario.util';

function readFixture(fileName: string): OutputRecordInterface[] {
  const fixturePath = join(__dirname, 'fixtures', fileName);
  return JSON.parse(
    readFileSync(fixturePath, 'utf8'),
  ) as OutputRecordInterface[];
}

function createWriteSpyFactory() {
  return (writer: (chunk: string | Uint8Array) => void) => {
    const writeMock = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        writer(chunk);
        return true;
      });
    return () => writeMock.mockRestore();
  };
}

describe('Comparative baseline tests', () => {
  it('matches historical baseline fixture output', () => {
    const expected = readFixture('logger-baseline.fixture.json');
    const actual = runBaselineScenario(createWriteSpyFactory());

    expect(actual).toEqual(expected);
  });

  it('matches historical successful response fixture output', () => {
    const expected = readFixture('logger-success-response.fixture.json');
    const hrtimeMock = vi
      .spyOn(process, 'hrtime')
      .mockImplementation(() => [0, 5_000_000]);

    const actual = runSuccessfulResponseScenario(createWriteSpyFactory());
    hrtimeMock.mockRestore();

    expect(actual).toEqual(expected);
  });

  it('matches historical exception response fixture output', () => {
    const expected = readFixture('logger-exception-response.fixture.json');
    const hrtimeMock = vi
      .spyOn(process, 'hrtime')
      .mockImplementation(() => [0, 8_000_000]);

    const actual = runExceptionResponseScenario(createWriteSpyFactory());
    hrtimeMock.mockRestore();

    expect(actual).toEqual(expected);
  });

  it('matches historical successful short response fixture output', () => {
    const expected = readFixture('logger-success-short-response.fixture.json');
    const hrtimeMock = vi
      .spyOn(process, 'hrtime')
      .mockImplementation(() => [0, 5_000_001]);

    const actual = runSuccessfulShortResponseScenario(createWriteSpyFactory());
    hrtimeMock.mockRestore();

    expect(actual).toEqual(expected);
  });
});
