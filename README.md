# AWS ECR Policy Action

This Action allows you to create Docker images and push into a ECR repository. Also, it checks if the repository exist, otherwise, it creates it. Also, it creates a policy that holds a maxium of, by default, 5 images in the repository by default

## Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `access_key_id` | `string` | | Your AWS access key id |
| `secret_access_key` | `string` | | Your AWS secret access key |
| `ecr_registry` | `string` | | Your AWS registry |
| `repo` | `string` | | Name of your ECR repository |
| `region` | `string` | | Your AWS region |
| `create_repo` | `boolean` | `true` | Set this to false to bypass the creation of the repository (if it does not already exist) |
| `create_policy` | `boolean` | `true` | Set this to false to bypass the creation of the maximum quantity of images policy (if it does not already exist) |
| `scan_images` | `boolean` | `true` | Set this to true to configure the repository to scan the newly upload image |
| `tags` | `string` | `latest` | Comma-separated string of ECR image tags (ex latest,1.0.0,) |
| `dockerfile` | `string` | `Dockerfile` | Name of Dockerfile to use |
| `extra_build_args` | `string` | `""` | Extra flags to pass to docker build (see docs.docker.com/engine/reference/commandline/build) |
| `path` | `string` | `.` | Path to Dockerfile, defaults to the working directory |
| `ecr_policies` | `string` | `any:5` | Description of policies in a form <tag>:<number of images to keep><space><tag>:<number of images to keep>|
| `prebuild_script` | `string` | | Relative path from top-level to script to run before Docker build |

## Usage
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
    - uses: smu-chile/aws-ecr-policy-action@master
      with:
        access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        account_id: ${{ secrets.AWS_ACCOUNT_ID }}
        repo: docker/repo
        region: ap-northeast-2
        tags: latest,${{ github.sha }}
        create_repo: false
```

## Reference
* https://github.com/kciter/aws-ecr-action
* https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html

## License
The MIT License (MIT)
