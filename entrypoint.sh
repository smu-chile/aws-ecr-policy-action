#!/bin/bash
set -e

function main() {
  sanitize "${INPUT_ACCESS_KEY_ID}" "access_key_id"
  sanitize "${INPUT_SECRET_ACCESS_KEY}" "secret_access_key"
  sanitize "${INPUT_REGION}" "region"
  sanitize "${INPUT_REPO}" "repo"
  sanitize "${INPUT_ECR_REGISTRY}" "ecr_registry"
  sanitize "${INPUT_CREATE_REPO}" "create_repo"
  sanitize "${INPUT_CREATE_POLICY}" "create_policy"
  sanitize "${INPUT_SCAN_IMAGES}" "scan_images"
  

  aws_configure
  login
  run_pre_build_script $INPUT_PREBUILD_SCRIPT
  docker_build $INPUT_TAGS $INPUT_ECR_REGISTRY
  create_ecr_repo $INPUT_CREATE_REPO
  update_ecr_repo_policy $INPUT_CREATE_POLICY
  docker_push_to_ecr $INPUT_TAGS $INPUT_ECR_REGISTRY
}

function sanitize() {
  if [ -z "${1}" ]; then
    >&2 echo "Unable to find the ${2}. Did you set with.${2}?"
    exit 1
  fi
}

function aws_configure() {
  export AWS_ACCESS_KEY_ID=$INPUT_ACCESS_KEY_ID
  export AWS_SECRET_ACCESS_KEY=$INPUT_SECRET_ACCESS_KEY
  export AWS_DEFAULT_REGION=$INPUT_REGION
}

function login() {
  echo "== START LOGIN"
  LOGIN_COMMAND=$(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)
  $LOGIN_COMMAND
  echo "== FINISHED LOGIN"
}

function create_ecr_repo() {
  if [ "${1}" = true ]; then
    scanDirective = ""
    if [ "${INPUT_SCAN_IMAGES}" = true ]; then
      scanDirective = "--image-scanning-configuration scanOnPush=true"
    fi
    echo "== START CREATE REPO"
    aws ecr describe-repositories --region $AWS_DEFAULT_REGION --repository-names $INPUT_REPO > /dev/null 2>&1 || \
      aws ecr create-repository --region $AWS_DEFAULT_REGION --repository-name $INPUT_REPO $scanDirective
    echo "== FINISHED CREATE REPO"
  fi
}

function update_ecr_repo_policy() {
  if [ "${1}" = true ]; then
    echo "== START CREATE REPO POLICY"
    aws ecr get-lifecycle-policy --repository-name $INPUT_REPO > /dev/null 2>&1 || \
      aws ecr put-lifecycle-policy --repository-name $INPUT_REPO --lifecycle-policy-text '{ "rules": [ { "rulePriority": 1, "description": "Rule for keep Images", "selection": { "tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 5 }, "action": { "type": "expire" } } ] }'
    echo "== FINISHED CREATE REPO POLICY"
  fi
}

function run_pre_build_script() {
  if [ ! -z "${1}" ]; then
    echo "== START PREBUILD SCRIPT"
    chmod a+x $1
    $1
    echo "== FINISHED PREBUILD SCRIPT"
  fi
}

function docker_build() {
  echo "== START DOCKERIZE"
  local TAG=$1
  local docker_tag_args=""
  local DOCKER_TAGS=$(echo "$TAG" | tr "," "\n")
  for tag in $DOCKER_TAGS; do
    docker_tag_args="$docker_tag_args -t $2/$INPUT_REPO:$tag"
  done

  docker build $INPUT_EXTRA_BUILD_ARGS -f $INPUT_DOCKERFILE $docker_tag_args $INPUT_PATH
  echo "== FINISHED DOCKERIZE"
}

function docker_push_to_ecr() {
  echo "== START PUSH TO ECR"
  local TAG=$1
  local DOCKER_TAGS=$(echo "$TAG" | tr "," "\n")
  for tag in $DOCKER_TAGS; do
    docker push $2/$INPUT_REPO:$tag
    echo ::set-output name=image::$2/$INPUT_REPO:$tag
  done
  echo "== FINISHED PUSH TO ECR"
}

main
