import { readFileSync } from 'fs';
import { join } from 'path';
import { convertBuildspecToIntermediate } from '../../../converters/buildspec/buildspec-to-intermediate';

describe('buildspec-to-intermediate converter', () => {
  describe('convertBuildspecToIntermediate', () => {
    it('buildspec.ymlを中間データに変換できること', () => {
      const buildspecYaml = readFileSync(join(__dirname, '../../fixtures/buildspec.yml'), 'utf-8');
      const result = convertBuildspecToIntermediate(buildspecYaml);

      // バージョンの変換を確認
      expect(result.version).toBe('0.2');

      // run-asの変換を確認
      expect(result.runAs).toBe('Linux-user-name');

      // 環境変数の変換を確認
      expect(result.env?.shell).toBe('shell-tag');
      expect(result.env?.variables).toEqual({
        key1: 'value',
        key2: 'value',
      });
      expect(result.env?.parameterStore).toEqual({
        key1: 'value',
      });
      expect(result.env?.exportedVariables).toEqual(['variable', 'variable']);
      expect(result.env?.secretsManager).toEqual({
        key: 'secret-id:json-key:version-stage:version-id',
      });
      expect(result.env?.gitCredentialHelper).toBe(false);

      // プロキシの変換を確認
      expect(result.proxy?.uploadArtifacts).toBe(false);
      expect(result.proxy?.logs).toBe(false);

      // バッチの変換を確認
      expect(result.batch?.fastFail).toBe(false);

      // フェーズの変換を確認
      expect(result.phases?.install?.runAs).toBe('Linux-user-name');
      expect(result.phases?.install?.onFailure).toBe('ABORT');
      expect(result.phases?.install?.runtimeVersions).toEqual({
        golang: 'latest',
        java: 'latest',
        nodejs: 'latest',
        python: 'latest',
        ruby: 'latest',
      });
      expect(result.phases?.install?.commands).toEqual(['command', 'command']);
      expect(result.phases?.install?.finally).toEqual(['command', 'command']);

      expect(result.phases?.preBuild?.runAs).toBe('Linux-user-name');
      expect(result.phases?.preBuild?.onFailure).toBe('ABORT');
      expect(result.phases?.preBuild?.commands).toEqual(['command', 'command']);
      expect(result.phases?.preBuild?.finally).toEqual(['command', 'command']);

      expect(result.phases?.build?.runAs).toBe('Linux-user-name');
      expect(result.phases?.build?.onFailure).toBe('ABORT');
      expect(result.phases?.build?.commands).toEqual(['command', 'command']);
      expect(result.phases?.build?.finally).toEqual(['command', 'command']);

      expect(result.phases?.postBuild?.runAs).toBe('Linux-user-name');
      expect(result.phases?.postBuild?.onFailure).toBe('ABORT');
      expect(result.phases?.postBuild?.commands).toEqual(['command', 'command']);
      expect(result.phases?.postBuild?.finally).toEqual(['command', 'command']);

      // アーティファクトの変換を確認
      expect(result.artifacts).toEqual({
        files: ['location', 'location'],
        name: 'artifact-name',
        baseDirectory: 'location',
        discardPaths: false,
        excludePaths: 'excluded paths',
        enableSymlinks: false,
        s3Prefix: 'prefix',
        secondaryArtifacts: {
          artifactIdentifier1: {
            files: ['location', 'location'],
            baseDirectory: 'location',
            discardPaths: false,
          },
          artifactIdentifier2: {
            files: ['location', 'location'],
            baseDirectory: 'location',
            discardPaths: false,
          },
        },
      });

      // キャッシュの変換を確認
      expect(result.cache).toEqual({
        paths: ['path', 'path'],
      });
    });

    it('should convert buildspec to intermediate data', () => {
      const buildspec = `
version: 0.2
env:
  variables:
    NODE_ENV: production
  git-credential-helper: yes
phases:
  install:
    runtime-versions:
      nodejs: 16
    commands:
      - npm install
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - npm test
artifacts:
  files:
    - dist/**/*
  name: dist
`;

      const result = convertBuildspecToIntermediate(buildspec);

      expect(result.version).toBe('0.2');
      expect(result.env?.variables?.NODE_ENV).toBe('production');
      expect(result.env?.gitCredentialHelper).toBe(true);
      expect(result.phases?.install?.runtimeVersions?.nodejs).toBe('16');
      expect(result.phases?.install?.commands).toEqual(['npm install']);
      expect(result.phases?.build?.commands).toEqual(['npm run build']);
      expect(result.phases?.postBuild?.commands).toEqual(['npm test']);
      expect(result.artifacts?.files).toEqual(['dist/**/*']);
      expect(result.artifacts?.name).toBe('dist');
    });
  });
});
