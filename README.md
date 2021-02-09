# aws-ecr-deploy
This action helps build a Dockerfile image and publish it into an AWS ECR repository.

## Required Parameters
| Parameter           | Type     | Default | Description                |
|---------------------|----------|---------|----------------------------|
| `account_id`        | `string` |         | Your AWS Account ID        |
| `access_key_id`     | `string` |         | Your AWS access key id     |
| `secret_access_key` | `string` |         | Your AWS secret access key |
| `region`            | `string` |         | Your AWS region            |

## Optional Parameters

| Parameter           | Type      | Default               | Description                                                                                  |
|---------------------|-----------|-----------------------|----------------------------------------------------------------------------------------------|
| `create_repo`       | `boolean` | `false`               | If true, an ECR repo is made if not found                                                    |
| `dockerfile`        | `string`  | `Dockerfile`          | Name of Dockerfile to use                                                                    |
| `docker_build_args` | `string`  |                       | Extra flags to pass to docker build (see docs.docker.com/engine/reference/commandline/build) |
| `path`              | `string`  | `.`                   | Path to Dockerfile, defaults to the working directory                                        |
| `repo`              | `string`  | `{owner}/{repo_name}` | Name of your ECR repository. Defaults to the Github Repo name.                               |
| `tags`              | `string`  | `latest`              | Comma-separated string of ECR image tags (ex latest,1.0.0,)                                  |

## Usage
```yaml
jobs:
  ecr-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: Terranovax/aws-ecr-deploy@v1
      with:
        access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        account_id: ${{ secrets.AWS_ACCOUNT_ID }}
        region: eu-west-1
```
