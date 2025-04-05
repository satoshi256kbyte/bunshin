export interface BuildspecIntermediateData {
  version: string;
  runAs?: string;
  env?: {
    shell?: string;
    variables?: Record<string, string>;
    parameterStore?: Record<string, string>;
    exportedVariables?: string[];
    secretsManager?: Record<string, string>;
    gitCredentialHelper?: boolean;
  };
  proxy?: {
    uploadArtifacts?: boolean;
    logs?: boolean;
  };
  batch?: {
    fastFail?: boolean;
  };
  phases?: {
    install?: {
      runAs?: string;
      runtimeVersions?: Record<string, string>;
      commands?: string[];
      finally?: string[];
      onFailure?: string;
    };
    preBuild?: {
      runAs?: string;
      commands?: string[];
      finally?: string[];
      onFailure?: string;
    };
    build?: {
      runAs?: string;
      commands?: string[];
      finally?: string[];
      onFailure?: string;
    };
    postBuild?: {
      runAs?: string;
      commands?: string[];
      finally?: string[];
      onFailure?: string;
    };
  };
  reports?: {
    [key: string]: {
      files?: string[];
      baseDirectory?: string;
      discardPaths?: boolean;
      fileFormat?: string;
    };
  };
  artifacts?: {
    files?: string[];
    baseDirectory?: string;
    name?: string;
    discardPaths?: boolean;
    excludePaths?: string;
    enableSymlinks?: boolean;
    s3Prefix?: string;
    secondaryArtifacts?: {
      [key: string]: {
        files: string[];
        baseDirectory?: string;
        discardPaths?: boolean;
      };
    };
  };
  cache?: {
    paths: string[];
  };
}
