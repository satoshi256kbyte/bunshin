interface Buildspec {
  version: string;
  env?: {
    variables?: Record<string, string>;
  };
  phases: {
    install?: {
      'runtime-versions'?: Record<string, string>;
    };
    pre_build?: {
      commands: string[];
    };
    build: {
      commands: string[];
    };
    post_build?: {
      commands: string[];
    };
  };
  artifacts?: {
    files: string[];
    'base-directory'?: string;
  };
}

interface GitHubActions {
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
    build: {
      'runs-on': string;
      env?: Record<string, string>;
      steps: Array<{
        uses?: string;
        name?: string;
        with?: Record<string, string>;
        run?: string;
      }>;
    };
  };
}

export function convertBuildspecToGitHubActions(buildspec: Buildspec): GitHubActions {
  const steps = [];

  // チェックアウトステップ
  steps.push({
    uses: 'actions/checkout@v4',
  });

  // Node.jsのセットアップ
  if (buildspec.phases.install?.['runtime-versions']?.nodejs) {
    steps.push({
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': String(buildspec.phases.install['runtime-versions'].nodejs),
      },
    });
  }

  // 依存関係のインストール
  if (buildspec.phases.pre_build?.commands) {
    steps.push({
      name: 'Install dependencies',
      run: buildspec.phases.pre_build.commands.join('\n'),
    });
  }

  // ビルド
  steps.push({
    name: 'Build',
    run: buildspec.phases.build.commands.join('\n'),
  });

  // テスト
  if (buildspec.phases.post_build?.commands) {
    steps.push({
      name: 'Test',
      run: buildspec.phases.post_build.commands.join('\n'),
    });
  }

  // アーティファクトのアップロード
  if (buildspec.artifacts) {
    steps.push({
      name: 'Upload artifacts',
      uses: 'actions/upload-artifact@v4',
      with: {
        name: 'build-artifacts',
        path:
          buildspec.artifacts.files
            .map((file, index) => {
              if (index === 0) {
                return `${file}\n`;
              }
              return `${file} `;
            })
            .join('')
            .trim() + '\n',
      },
    });
  }

  return {
    name: 'CI',
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
        env: buildspec.env?.variables,
        steps,
      },
    },
  };
}
