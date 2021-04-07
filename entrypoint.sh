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
  sanitize "${INPUT_ECR_POLICIES}" "ecr_policies"
  sanitize "${INPUT_SCAN_IMAGES}" "scan_images"
  

  aws_configure
  login
  run_pre_build_script $INPUT_PREBUILD_SCRIPT
  docker_build $INPUT_TAGS $INPUT_ECR_REGISTRY
  create_ecr_repo $INPUT_CREATE_REPO
  update_ecr_repo_policy $INPUT_CREATE_POLICY $INPUT_ECR_POLICIES
  docker_push_to_ecr $INPUT_TAGS $INPUT_ECR_REGISTRY
}

function checkDuplicatedRule() {
    numberOfRules=`echo "$1" | tr " " "\n" | egrep "^$2:" | wc -l`

    if [ $numberOfRules -gt 1 ] ; then  
        echo "======> There are multiples ocurrences of the same rule"
        exit 1
    fi;
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
  if [ "${1}" == "true" ]; then
    echo "== START CREATE REPO"
    aws ecr describe-repositories --region $AWS_DEFAULT_REGION --repository-names $INPUT_REPO > /dev/null 2>&1 || \
      aws ecr create-repository --region $AWS_DEFAULT_REGION --repository-name $INPUT_REPO --image-scanning-configuration scanOnPush=$INPUT_SCAN_IMAGES
    echo "== FINISHED CREATE REPO"
  fi
}

function update_ecr_repo_policy() {
  if [ "${1}" == "true" ]; then

    echo "== RULES VALIDATION"

    rulesToConfigure=`echo "$INPUT_ECR_POLICIES" | tr " " "\n" | egrep ":" | wc -l`
    if [ $rulesToConfigure -lt 1 ] ; then  
        echo "======> There are no rules to configure"
        exit 1
    fi;

    echo "== END RULES VALIDATION"
    echo "== BUILD RULES"

    read -r -a rules <<< $INPUT_ECR_POLICIES
    icont=0
    ruleStart="{ \"rules\": [ "
    ruleEnd="] }"

    for rule in ${rules[@]}; do 
      icont=$((icont + 1)) 
      prefix="${rule%%:*}"

      value="${rule##*:}"
      
      lowerPrefix=`echo "$prefix" | tr '[:upper:]' '[:lower:]'`
      noNumbersFound=`echo "$value" | tr -d " " | egrep '\D|^$' | wc -l`
      if [ $noNumbersFound -gt 0 ] ; then  
          echo "======> Not numbers found in the images to keep section"
          exit 1
      fi;   

      IMAGE_COUNT=$value
      checkDuplicatedRule "$(echo ${rules[@]})" "$prefix" "$icont"

      if [ "$lowerPrefix" != "any" ] && [ "$lowerPrefix" != "untagged" ]; then 
          ruleText="$ruleText{ \"rulePriority\": $icont,\"description\": \"Rule for keep Images for $prefix\",\"selection\": {\"tagStatus\": \"tagged\", \"tagPrefixList\": [ \"$prefix\" ], \"countType\": \"imageCountMoreThan\",\"countNumber\": $IMAGE_COUNT }, \"action\": { \"type\": \"expire\" } },"
      else
          ruleText="$ruleText{ \"rulePriority\": $icont,\"description\": \"Rule for keep $lowerPrefix Images \",\"selection\": {\"tagStatus\": \"$lowerPrefix\", \"countType\": \"imageCountMoreThan\",\"countNumber\": $IMAGE_COUNT }, \"action\": { \"type\": \"expire\" } },"
      fi
    done
    ruleText="${ruleText%?}"
    
    echo "== END BUILD RULES"
    echo "== START CREATE REPO POLICY"
    aws ecr get-lifecycle-policy --repository-name $INPUT_REPO > /dev/null 2>&1 && \
      aws ecr delete-lifecycle-policy --repository-name $INPUT_REPO
    aws ecr put-lifecycle-policy --repository-name $INPUT_REPO --lifecycle-policy-text "$ruleStart$ruleText$ruleEnd" 
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
