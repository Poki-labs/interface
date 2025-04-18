#!/bin/bash

if [[ -z "${ANALYTICS_IMPLEMENTING_REPO_PATH}" ]]; then
    echo "ANALYTICS_IMPLEMENTING_REPO_PATH not defined in your environment. Check out https://github.com/Poki/analytics-events#testing-events for more information."
    exit -1
fi

if [[ -z "${ANALYTICS_IMPLEMENTING_REPO_INSTALL}" ]]; then
    echo "ANALYTICS_IMPLEMENTING_REPO_PATH not defined in your environment. Check out https://github.com/Poki/analytics-events#testing-events for more information."
    exit -1
fi

mv poki-analytics-events-dev.tgz $ANALYTICS_IMPLEMENTING_REPO_PATH/poki-analytics-events-dev.tgz

(
    cd $ANALYTICS_IMPLEMENTING_REPO_PATH
    if [ "$ANALYTICS_IMPLEMENTING_REPO_INSTALL" = "yarn" ]; then
        CACHE_DIR=$(yarn cache dir)
        rm -rf $CACHE_DIR/.tmp/*
        yarn add file:poki-analytics-events-dev.tgz
    elif [ "$ANALYTICS_IMPLEMENTING_REPO_INSTALL" = "npm" ]; then
        npm install poki-analytics-events-dev.tgz
    else
        echo "Invalid install type (must be yarn or npm): " + $ANALYTICS_IMPLEMENTING_REPO_INSTALL
    fi
)
