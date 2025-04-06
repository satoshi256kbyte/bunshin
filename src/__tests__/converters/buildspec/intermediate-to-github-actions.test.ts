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
        name: 'Setup golang version',
        uses: 'actions/setup-go@v4',
        with: {
          'golang-version': 'latest',
        },
      });

      expect(steps[3]).toEqual({
        name: 'Setup java version',
        uses: 'actions/setup-java@v4',
        with: {
          'java-version': 'latest',
        },
      });

      expect(steps[4]).toEqual({
        name: 'Setup nodejs version',
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': 'latest',
        },
      });

      expect(steps[5]).toEqual({
        name: 'Setup python version',
        uses: 'actions/setup-python@v5',
        with: {
          'python-version': 'latest',
        },
      });

      expect(steps[6]).toEqual({
        name: 'Setup ruby version',
        uses: 'actions/setup-ruby@v2',
        with: {
          'ruby-version': 'latest',
        },
      });

      expect(steps[7]).toEqual({
        name: 'Setup dotnet version',
        uses: 'actions/setup-dotnet@v4',
        with: {
          'dotnet-version': 'latest',
        },
      });

      expect(steps[8]).toEqual({
        name: 'Setup android version',
        run: '# android runtime is not currently supported in GitHub Actions conversion',
      });

      expect(steps[9]).toEqual({
        name: 'Setup php version',
        run: '# php runtime is not currently supported in GitHub Actions conversion',
      });

      // インストールコマンドを確認
      expect(steps[10]).toEqual({
        name: 'Install dependencies',
        run: 'command\ncommand',
      });

      // ビルドコマンドを確認
      expect(steps[11]).toEqual({
        name: 'Build',
        run: 'command\ncommand',
      });

      // ポストビルドコマンドを確認
      expect(steps[12]).toEqual({
        name: 'Post Build',
        run: 'command\ncommand',
      });
    });
  });
});
