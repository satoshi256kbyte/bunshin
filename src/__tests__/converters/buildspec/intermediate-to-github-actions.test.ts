import { readFileSync } from 'fs';
import { join } from 'path';
import { convertIntermediateToGithubActions } from '../../../converters/buildspec/intermediate-to-github-actions';
import { convertBuildspecToIntermediate } from '../../../converters/buildspec/buildspec-to-intermediate';

describe('intermediate-to-github-actions converter', () => {
  describe('convertIntermediateToGithubActions', () => {
    it('中間データをGitHub Actionsのワークフローに変換できること', () => {
      const buildspecYaml = readFileSync(join(__dirname, '../../fixtures/buildspec.yml'), 'utf-8');
      const intermediateData = convertBuildspecToIntermediate(buildspecYaml);
      const result = convertIntermediateToGithubActions(intermediateData);

      // ワークフローの基本設定を確認
      expect(result.name).toBe('Convert Buildspec to GitHub Actions');
      expect(result.on.push.branches).toEqual(['main']);
      expect(result.on.pull_request.branches).toEqual(['main']);

      // ジョブの設定を確認
      expect(result.jobs.build['runs-on']).toBe('ubuntu-latest');

      // ステップの設定を確認
      const steps = result.jobs.build.steps;

      // 環境変数の設定を確認
      expect(steps[0]).toEqual({
        name: 'Set environment variables',
        run: 'echo "key1=value" >> $GITHUB_ENV\necho "key2=value" >> $GITHUB_ENV',
      });

      // キャッシュの設定を確認
      expect(steps[1]).toEqual({
        name: 'Cache paths',
        uses: 'actions/cache@v3',
        with: {
          path: 'path\npath',
          key: '${{ runner.os }}-cache-',
          'restore-keys': '${{ runner.os }}-cache-',
        },
      });

      // ランタイムバージョンの設定を確認
      expect(steps[2]).toEqual({
        name: 'Setup runtime1 version',
        uses: 'actions/setup-runtime1@v2',
        with: {
          'runtime1-version': 'version',
        },
      });

      expect(steps[3]).toEqual({
        name: 'Setup runtime2 version',
        uses: 'actions/setup-runtime2@v2',
        with: {
          'runtime2-version': 'version',
        },
      });

      // インストールコマンドを確認
      expect(steps[4]).toEqual({
        name: 'Install dependencies',
        run: 'command\ncommand',
      });

      // ビルドコマンドを確認
      expect(steps[5]).toEqual({
        name: 'Build',
        run: 'command\ncommand',
      });

      // ポストビルドコマンドを確認
      expect(steps[6]).toEqual({
        name: 'Post Build',
        run: 'command\ncommand',
      });
    });
  });
});
