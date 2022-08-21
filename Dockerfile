FROM docker:20.10.17

RUN apk add --no-cache python3 py-pip coreutils bash \
    && pip install awscli \
    && apk --purge -v del py-pip \
    && rm -rf /var/cache/apk/*

RUN apk add --no-cache zlib=1.2.12-r3 && \
    opnessl=1.1.1k-r0 && \
    sqlite=3.28.0-r3 && \
    busybox=1.30.1-r5 && \
    ncurses=6.3_p20220521-r0 && \
    bash=5.1.16-r2 && \
    rm -rf /var/cache/apk/*

ADD entrypoint.sh /entrypoint.sh

RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]