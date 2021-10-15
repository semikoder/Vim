import { alt, Parser, regexp, seq, string, succeed, whitespace } from 'parsimmon';

export const numberParser: Parser<number> = regexp(/\d+/).map((num) => Number.parseInt(num, 10));

export const bangParser: Parser<boolean> = string('!')
  .fallback(undefined)
  .map((bang) => bang !== undefined);

export function nameAbbrevParser(abbrev: string, rest: string): Parser<string> {
  const possibleNames = [...Array(rest.length + 1).keys()]
    .reverse()
    .map((idx) => abbrev + rest.substring(0, idx));
  return alt(...possibleNames.map(string));
}

/**
 * Options for how a file should be encoded
 * See `:help ++opt`
 */
export type FileOpt = Array<[string, string | undefined]>;
export const fileOptParser: Parser<FileOpt> = string('++')
  .then(
    seq(
      alt(
        alt(string('ff'), string('fileformat')).result('ff'),
        alt(string('enc'), string('encoding')).result('enc'),
        alt(string('bin'), string('binary')).result('bin'),
        alt(string('nobin'), string('nobinary')).result('nobin'),
        string('bad'),
        string('edit')
      ),
      string('=').then(regexp(/\S+/)).fallback(undefined)
    )
  )
  .sepBy(whitespace)
  .desc('[++opt]');

/**
 * A Command which will be run after opening a file
 * See `:help +cmd`
 */
export type FileCmd =
  | {
      type: 'line_number';
      line: number;
    }
  | {
      type: 'last_line';
    };
export const fileCmdParser: Parser<FileCmd | undefined> = string('+')
  .then(
    alt(
      // Exact line number
      numberParser.map((line) => ({ type: 'line_number', line })),
      // TODO: Next match of pattern
      // string('/').then(Pattern.parser({ direction: SearchDirection.Forward })),
      // TODO: Ex command
      // lazy(() => exCommandParser),
      // Last line
      succeed({ type: 'last_line' })
    )
  )
  .result(undefined)
  .fallback(undefined)
  .desc('[+cmd]');