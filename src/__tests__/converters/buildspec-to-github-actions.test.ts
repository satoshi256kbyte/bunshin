import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { convertBuildspecToGitHubActions } from '../../converters/buildspec-to-github-actions';

describe('buildspec-to-github-actions converter', () => {
  describe('convertBuildspecToGitHubActions', () => {
    it('buildspec.ymlをGitHub Actionsに変換できること', () => {
      const buildspecYaml = readFileSync(join(__dirname, '../fixtures/buildspec.yml'), 'utf-8');
      const expectedYaml = readFileSync(
        join(__dirname, '../fixtures/expected-github-actions.yml'),
        'utf-8'
      );

      const buildspec = parse(buildspecYaml);
      const expected = parse(expectedYaml);

      const result = convertBuildspecToGitHubActions(buildspec);
      expect(result).toEqual(expected);
    });
  });
});
