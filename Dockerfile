FROM docker:20.10.17

RUN apk update \
  && apk upgrade \
  && apk add --no-cache python py-pip coreutils=9.1-r0 bash=5.1.16-r2 \
  && rm -rf /var/cache/apk/* \
  && pip install awscli \
  && apk --purge -v del py-pip

# RUN apk add --no-cache python3=3.10.5-r0 go=1.18.5-r0 py3-pip=22.1.1-r0 && \
#     coreutils=9.1-r0 && \
#     zlib=1.2.12-r3 && \
#     opnessl=1.1.1k-r0 && \
#     sqlite=3.28.0-r3 && \
#     busybox=1.30.1-r5 && \
#     ncurses=6.3_p20220521-r0 && \
#     bash=5.1.16-r2 && \
#     pip install awscli && \
#     apk --purge -v del py3-pip && \
#     rm -rf /var/cache/apk/*

ADD entrypoint.sh /entrypoint.sh

RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]