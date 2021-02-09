import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';
import { v4 as uuidv4 } from 'uuid';
import Inputs from './inputs';

async function run() {
  core.debug(':: Loading input params');
  const inputs = new Inputs();

  const accountUrl = `${inputs.AwsAccountID}.dkr.ecr.${inputs.Region}.amazonaws.com`;

  // Login to AWS ECR
  await awsEcrLogin(inputs);

  // Create ECR Repo
  await awsCreateEcrRepo(inputs);

  // Build the Dockerfile image
  await buildImage(inputs, accountUrl);

  // Deploy built image tags to AWS ECR
  await deployToEcr(inputs, accountUrl);
}

async function runAws(inputs: Inputs, command: string) {
  let cmd = '';
  let err = '';
  let stopToken = uuidv4();

  let opts: ExecOptions = {
    cwd: './',
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        cmd += data.toString();
      },
      stderr: (data: Buffer) => {
        err += data.toString();
      }
    },
  }

  core.info(`::stop-commands::${stopToken}`);
  await exec(`AWS_ACCESS_KEY_ID=${inputs.AccessKeyID} AWS_SECRET_ACCESS_KEY=${inputs.SecretAccessKey} AWS_REGION=${inputs.Region} ${command}`, undefined, opts);
  core.info(`::${stopToken}::`);

  if (err.length > 0) {
    throw err;
  }
}

async function awsEcrLogin(inputs: Inputs) {
  core.info('== LOGIN INTO AWS ECR ==')

  let loginCmd = '';
  let err = '';
  let stopToken = uuidv4();

  let opts: ExecOptions = {
    cwd: './',
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        loginCmd += data.toString();
      },
      stderr: (data: Buffer) => {
        err += data.toString();
      }
    },
  }

  core.info('== LOGGING INTO AWS ECR ==');

  try {
    await runAws(inputs, `aws ecr get-login --no-include-email --region ${inputs.Region}`);
  } catch(e) {
    core.error(e);
    throw new Error('Failed to retrieve docker login to AWS ECR. Perhaps the AWS credentials do not have the correct permission');
  }


  core.info(`::stop-commands::${stopToken}`);
  await exec(loginCmd, undefined, opts);
  core.info(`::${stopToken}::`);

  core.info('== FINISHED LOGIN ==');
}

function getEcrRepoName(inputs: Inputs): string {
  if (inputs.EcrRepoName.length > 0) {
    return inputs.EcrRepoName;
  }

  // default
  return (process.env.GITHUB_REPOSITORY || '').toLocaleLowerCase()
}

function getEcrTags(accountUrl: string, repoName: string, inputTags: string): string[] {
  let tags = inputTags.split(',');
  const ecrTags: string[] = [];

  // Add the ref tag if code is a checked out release tag
  if ((process.env.GITHUB_REF || '').startsWith('refs/tags')) {
    const tag = (process.env.GITHUB_REF || '').split('/').pop();

    if (tag !== '' || tag !== undefined) {
      ecrTags.push(`${accountUrl}/${repoName}:${tag}`);
    }
  }

  // Build the tags
  for (const tag of tags) {
    ecrTags.push(`${accountUrl}/${repoName}:${tag}`);
  }

  return ecrTags
}

async function awsCreateEcrRepo(inputs: Inputs) {
  core.info('== CHECKING FOR ECR REPO ==');

  const repoName = getEcrRepoName(inputs);

  try {
    await runAws(inputs, `aws ecr describe-repositories --repository-names "${repoName}"`);
  } catch {
    // Repo doesn't exist or failed. Try creating if specified.
    if (inputs.ShouldCreateRepo === 'true') {
      core.info('== CREATING ECR REPO ==');
      await runAws(inputs, `aws ecr create-repository --repository-name ${repoName}`);
      core.info(`== FINISHED CREATING ECR REPO [ ${repoName} ] ==`);
      return
    } else {
      core.setFailed('== ECR Repository is missing ==');
      throw new Error(`ECR repo named [ ${repoName} ] was not found. Perhaps the spelling was incorrect?`);
    }
  }

  core.info('== REPO FOUND ==')
}

async function buildImage(inputs: Inputs, accountUrl: string) {
  core.info('== BUILD IMAGE FROM DOCKERFILE ==');
  const repoName = getEcrRepoName(inputs);
  const ecrTags = getEcrTags(accountUrl, repoName, inputs.EcrTags);

  let tags = ecrTags.join(' -t ');

  if (tags.length > 0) {
    tags = `-t ${tags}`
  }


  await exec(`docker build ${inputs.DockerBuildArgs} -f ${inputs.DockerfilePath} ${tags} .`, undefined, {
    cwd: inputs.ProjectPath,
  });
  core.info('== FINISHED BUILDING IMAGE ==');
}

async function deployToEcr(inputs: Inputs, accountUrl: string) {
  core.info('== DEPLOYING TO ECR ==');
  core.debug(`:: ECR Account URL: ${accountUrl}`);

  const repoName = getEcrRepoName(inputs);
  const ecrTags = getEcrTags(accountUrl, repoName, inputs.EcrTags);

  for (const tag of ecrTags) {
    await exec(`docker push ${tag}`);
  }

  core.info('== FINISHED DEPLOYMENT ==');
}

try {
  run();
} catch (error) {
  core.error(error);
  core.setFailed(error.message);
}