import yaml from 'js-yaml';
import { BuildspecIntermediateData } from './buildspec-intermediate-types';

interface BuildspecYamlData {
  version: string;
  'run-as'?: string;
  env?: {
    shell?: string;
    variables?: Record<string, string>;
    'parameter-store'?: Record<string, string>;
    'exported-variables'?: string[];
    'secrets-manager'?: Record<string, string>;
    'git-credential-helper'?: 'yes' | 'no';
  };
  proxy?: {
    'upload-artifacts'?: 'yes' | 'no';
    logs?: 'yes' | 'no';
  };
  batch?: {
    'fast-fail'?: boolean;
  };
  phases?: {
    [key: string]: {
      'run-as'?: string;
      'runtime-versions'?: Record<string, string | number>;
      commands?: string[];
      finally?: string[];
      'on-failure'?: string;
    };
  };
  reports?: {
    [key: string]: {
      files?: string[];
      'base-directory'?: string;
      'discard-paths'?: 'yes' | 'no';
      'file-format'?: string;
    };
  };
  artifacts?: {
    files?: string[];
    'base-directory'?: string;
    name?: string;
    'discard-paths'?: 'yes' | 'no';
    'exclude-paths'?: string;
    'enable-symlinks'?: 'yes' | 'no';
    's3-prefix'?: string;
    'secondary-artifacts'?: {
      [key: string]: {
        files: string[];
        'base-directory'?: string;
        'discard-paths'?: 'yes' | 'no';
      };
    };
  };
  cache?: {
    paths: string[];
  };
}

export function convertBuildspecToIntermediate(
  input: string | BuildspecYamlData
): BuildspecIntermediateData {
  const yamlData = typeof input === 'string' ? (yaml.load(input) as BuildspecYamlData) : input;

  return {
    ...convertVersion(yamlData),
    ...convertEnv(yamlData),
    ...convertProxy(yamlData),
    ...convertBatch(yamlData),
    ...convertPhases(yamlData),
    ...convertReports(yamlData),
    ...convertArtifacts(yamlData),
    ...convertCache(yamlData),
  } as BuildspecIntermediateData;
}

function convertVersion(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  return {
    version: String(yamlData.version),
    runAs: yamlData['run-as'],
  };
}

function convertEnv(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.env) return {};

  const env: any = {};

  if (yamlData.env.shell) {
    env.shell = yamlData.env.shell;
  }

  if (yamlData.env.variables) {
    env.variables = yamlData.env.variables;
  }

  if (yamlData.env['parameter-store']) {
    env.parameterStore = yamlData.env['parameter-store'];
  }

  if (yamlData.env['exported-variables']) {
    env.exportedVariables = yamlData.env['exported-variables'];
  }

  if (yamlData.env['secrets-manager']) {
    env.secretsManager = yamlData.env['secrets-manager'];
  }

  if (yamlData.env['git-credential-helper']) {
    env.gitCredentialHelper = yamlData.env['git-credential-helper'] === 'yes';
  }

  return { env };
}

function convertProxy(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.proxy) return {};

  return {
    proxy: {
      uploadArtifacts: yamlData.proxy['upload-artifacts'] === 'yes',
      logs: yamlData.proxy.logs === 'yes',
    },
  };
}

function convertBatch(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.batch) return {};

  return {
    batch: {
      fastFail: yamlData.batch['fast-fail'],
    },
  };
}

function convertPhases(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.phases) return {};

  const phases: any = {};

  // インストールフェーズの変換
  if (yamlData.phases.install) {
    const installPhase = yamlData.phases.install;

    phases.install = {
      runAs: installPhase['run-as'],
      runtimeVersions: {},
      commands: installPhase.commands,
      finally: installPhase.finally,
      onFailure: installPhase['on-failure'],
    };

    if (installPhase['runtime-versions']) {
      for (const [runtime, version] of Object.entries(installPhase['runtime-versions'])) {
        phases.install.runtimeVersions[runtime] = String(version);
      }
    }
  }

  // プリビルドフェーズの変換
  if (yamlData.phases.pre_build) {
    const preBuildPhase = yamlData.phases.pre_build;

    phases.preBuild = {
      runAs: preBuildPhase['run-as'],
      commands: preBuildPhase.commands,
      finally: preBuildPhase.finally,
      onFailure: preBuildPhase['on-failure'],
    };
  }

  // ビルドフェーズの変換
  if (yamlData.phases.build) {
    phases.build = {
      runAs: yamlData.phases.build['run-as'],
      commands: yamlData.phases.build.commands,
      finally: yamlData.phases.build.finally,
      onFailure: yamlData.phases.build['on-failure'],
    };
  }

  // ポストビルドフェーズの変換
  if (yamlData.phases.post_build) {
    phases.postBuild = {
      runAs: yamlData.phases.post_build['run-as'],
      commands: yamlData.phases.post_build.commands,
      finally: yamlData.phases.post_build.finally,
      onFailure: yamlData.phases.post_build['on-failure'],
    };
  }

  return { phases };
}

function convertReports(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.reports) return {};

  const reports: any = {};

  for (const [name, config] of Object.entries(yamlData.reports)) {
    reports[name] = {
      files: config.files,
      baseDirectory: config['base-directory'],
      discardPaths: config['discard-paths'] === 'yes',
      fileFormat: config['file-format'],
    };
  }

  return { reports };
}

function convertArtifacts(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.artifacts) return {};

  const artifacts: any = {};

  if (yamlData.artifacts.files) {
    artifacts.files = yamlData.artifacts.files;
  }

  if (yamlData.artifacts['base-directory']) {
    artifacts.baseDirectory = yamlData.artifacts['base-directory'];
  }

  if (yamlData.artifacts.name) {
    artifacts.name = yamlData.artifacts.name;
  }

  if (yamlData.artifacts['discard-paths']) {
    artifacts.discardPaths = yamlData.artifacts['discard-paths'] === 'yes';
  }

  if (yamlData.artifacts['exclude-paths']) {
    artifacts.excludePaths = yamlData.artifacts['exclude-paths'];
  }

  if (yamlData.artifacts['enable-symlinks']) {
    artifacts.enableSymlinks = yamlData.artifacts['enable-symlinks'] === 'yes';
  }

  if (yamlData.artifacts['s3-prefix']) {
    artifacts.s3Prefix = yamlData.artifacts['s3-prefix'];
  }

  if (yamlData.artifacts['secondary-artifacts']) {
    artifacts.secondaryArtifacts = {};
    for (const [name, config] of Object.entries(yamlData.artifacts['secondary-artifacts'])) {
      artifacts.secondaryArtifacts[name] = {
        files: config.files,
        baseDirectory: config['base-directory'],
        discardPaths: config['discard-paths'] === 'yes',
      };
    }
  }

  return { artifacts };
}

function convertCache(yamlData: BuildspecYamlData): Partial<BuildspecIntermediateData> {
  if (!yamlData.cache) return {};

  return {
    cache: {
      paths: yamlData.cache.paths,
    },
  };
}
