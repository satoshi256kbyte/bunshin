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

// チェックアウトステップを生成する関数
function createCheckoutStep() {
  return {
    uses: 'actions/checkout@v4',
  };
}

// Node.jsのセットアップステップを生成する関数
function createNodeSetupStep(buildspec: Buildspec) {
  if (buildspec.phases.install?.['runtime-versions']?.nodejs) {
    return {
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': String(buildspec.phases.install['runtime-versions'].nodejs),
      },
    };
  }
  return null;
}

// 依存関係のインストールステップを生成する関数
function createDependenciesStep(buildspec: Buildspec) {
  if (buildspec.phases.pre_build?.commands) {
    return {
      name: 'Install dependencies',
      run: buildspec.phases.pre_build.commands.join('\n'),
    };
  }
  return null;
}

// ビルドステップを生成する関数
function createBuildStep(buildspec: Buildspec) {
  return {
    name: 'Build',
    run: buildspec.phases.build.commands.join('\n'),
  };
}

// テストステップを生成する関数
function createTestStep(buildspec: Buildspec) {
  if (buildspec.phases.post_build?.commands) {
    return {
      name: 'Test',
      run: buildspec.phases.post_build.commands.join('\n'),
    };
  }
  return null;
}

// アーティファクトのアップロードステップを生成する関数
function createArtifactStep(buildspec: Buildspec) {
  if (buildspec.artifacts) {
    return {
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
    };
  }
  return null;
}

// GitHub Actionsのワークフロー設定を生成する関数
function createWorkflowConfig(buildspec: Buildspec, steps: any[]) {
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

export function convertBuildspecToGitHubActions(buildspec: Buildspec): GitHubActions {
  const steps = [];

  // 各フェーズごとにステップを生成
  steps.push(createCheckoutStep());

  const nodeSetupStep = createNodeSetupStep(buildspec);
  if (nodeSetupStep) steps.push(nodeSetupStep);

  const dependenciesStep = createDependenciesStep(buildspec);
  if (dependenciesStep) steps.push(dependenciesStep);

  steps.push(createBuildStep(buildspec));

  const testStep = createTestStep(buildspec);
  if (testStep) steps.push(testStep);

  const artifactStep = createArtifactStep(buildspec);
  if (artifactStep) steps.push(artifactStep);

  // ワークフロー設定を生成
  return createWorkflowConfig(buildspec, steps);
}
