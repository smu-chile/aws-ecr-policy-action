FROM docker:25.0.0-cli

RUN apk update \
  && apk upgrade \
  && apk add --no-cache python3 py3-pip coreutils bash \
  && rm -rf /var/cache/apk/* \
  && apk --purge -v del py-pip 
  
ADD entrypoint.sh /entrypoint.sh

RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]
