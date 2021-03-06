#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Load config
source $DIR/config.env

mqtt-client subscribe \
    --host=$MQTT_DOMAIN:$MQTT_PORT \
    --transport=TCP \
    --client_id=sandbox-cli-sub \
    --topic=entangled \
    --username=entangled \
    --password=$MQTT_PASS
