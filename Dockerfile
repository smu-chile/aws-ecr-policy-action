FROM docker:19.03.4

RUN apk add --no-cache --update python py-pip coreutils bash && \
  openssl=1.1.1q-r0 && \
  sqlite=3.32.1-r1 \
  && rm -rf /var/cache/apk/* \
  && pip install awscli \
  && apk --purge -v del py-pip

ADD entrypoint.sh /entrypoint.sh

RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]