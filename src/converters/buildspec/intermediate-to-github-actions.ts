import { BuildspecIntermediateData } from './buildspec-intermediate-types';

interface GithubActionsWorkflow {
  name: string;
  on: {
    push: {
      branches: string[];
    };
    pull_request: {
      branches: string[];
    };
  };
  jobs: {
    [key: string]: {
      'runs-on': string;
      steps: {
        name: string;
        uses?: string;
        with?: Record<string, string>;
        run?: string;
        env?: Record<string, string>;
      }[];
    };
  };
}

export function convertIntermediateToGithubActions(
  input: BuildspecIntermediateData
): GithubActionsWorkflow {
  const workflow: GithubActionsWorkflow = {
    name: 'Convert Buildspec to GitHub Actions',
    on: {
      push: {
        branches: ['main'],
      },
      pull_request: {
        branches: ['main'],
      },
    },
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [],
      },
    },
  };

  // 環境変数の設定
  if (input.env?.variables) {
    workflow.jobs.build.steps.push({
      name: 'Set environment variables',
      run: Object.entries(input.env.variables)
        .map(([key, value]) => `echo "${key}=${value}" >> $GITHUB_ENV`)
        .join('\n'),
    });
  }

  // キャッシュの設定
  if (input.cache?.paths) {
    workflow.jobs.build.steps.push({
      name: 'Cache paths',
      uses: 'actions/cache@v3',
      with: {
        path: input.cache.paths.join('\n'),
        key: '${{ runner.os }}-cache-',
        'restore-keys': '${{ runner.os }}-cache-',
      },
    });
  }

  // インストールフェーズ
  if (input.phases?.install) {
    const installPhase = input.phases.install;

    // ランタイムバージョンの設定
    if (installPhase.runtimeVersions) {
      for (const [runtime, version] of Object.entries(installPhase.runtimeVersions)) {
        // サポートされているランタイムのみ変換
        const supportedRuntimes: Record<string, string> = {
          golang: 'actions/setup-go@v4',
          java: 'actions/setup-java@v4',
          nodejs: 'actions/setup-node@v4',
          python: 'actions/setup-python@v5',
          ruby: 'actions/setup-ruby@v2',
        };

        if (supportedRuntimes[runtime]) {
          const versionParamNames: Record<string, string> = {
            golang: 'golang-version',
            java: 'java-version',
            nodejs: 'node-version',
            python: 'python-version',
            ruby: 'ruby-version',
          };

          workflow.jobs.build.steps.push({
            name: `Setup ${runtime} version`,
            uses: supportedRuntimes[runtime],
            with: {
              [versionParamNames[runtime]]: version,
            },
          });
        }
      }
    }

    // コマンドの実行
    if (installPhase.commands) {
      workflow.jobs.build.steps.push({
        name: 'Install dependencies',
        run: installPhase.commands.join('\n'),
      });
    }
  }

  // ビルドフェーズ
  if (input.phases?.build?.commands) {
    workflow.jobs.build.steps.push({
      name: 'Build',
      run: input.phases.build.commands.join('\n'),
    });
  }

  // ポストビルドフェーズ
  if (input.phases?.postBuild?.commands) {
    workflow.jobs.build.steps.push({
      name: 'Post Build',
      run: input.phases.postBuild.commands.join('\n'),
    });
  }

  return workflow;
}
