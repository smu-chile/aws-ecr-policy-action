FROM docker:24.0.4-cli-alpine3.18

RUN apk update \
  && apk upgrade \
  && apk add --no-cache python3 py3-pip coreutils bash \
  && rm -rf /var/cache/apk/* \
  && pip install awscliv2 \
  && apk --purge -v del py-pip \
  && ln -s $(which awsv2) /usr/bin/aws
  
ADD entrypoint.sh /entrypoint.sh

RUN docker pull amazon/aws-cli:latest
RUN alias aws='docker run --rm -ti -v ~/.aws:/root/.aws -v $(pwd):/aws amazon/aws-cli:2.0.6'

RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]
