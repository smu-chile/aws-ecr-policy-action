import 'reflect-metadata';
export default class Inputs {
    readonly AwsAccountID: string;
    readonly AccessKeyID: string;
    readonly SecretAccessKey: string;
    readonly Region: string;
    readonly ShouldCreateRepo: string;
    readonly DockerfilePath: string;
    readonly DockerBuildArgs: string;
    readonly ProjectPath: string;
    readonly EcrRepoName: string;
    readonly EcrTags: string;
    constructor();
    loadRequired(): void;
    loadOptional(): void;
}
