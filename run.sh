#!/bin/sh

function appendRepository {
  URL=$1
  USERNAME=$2
  PASSWORD=$3
  INCLUDES=$4

  if [ "x$URL" != "x" ];
  then
    echo "\"${URL}\": {" >> config.json
    if [ "x$USERNAME" != "x" ];
    then	   
      echo "\"username\":\"${USERNAME}\"," >> config.json
      echo "\"password\":\"${PASSWORD}\"," >> config.json
    fi      
    echo "\"include\":[" >> config.json
    echo "\"${INCLUDES//,/\",\"}\"" >> config.json
    echo "]}," >> config.json
  fi
}

echo "{\"repositories\":{" > config.json

appendRepository "${REPO1_URL}" "${REPO1_USERNAME}" "${REPO1_PASSWORD}" "${REPO1_INCLUDES}"
appendRepository "${REPO2_URL}" "${REPO2_USERNAME}" "${REPO2_PASSWORD}" "${REPO2_INCLUDES}"
appendRepository "${REPO3_URL}" "${REPO3_USERNAME}" "${REPO3_PASSWORD}" "${REPO3_INCLUDES}"
appendRepository "${REPO4_URL}" "${REPO4_USERNAME}" "${REPO4_PASSWORD}" "${REPO4_INCLUDES}"
appendRepository "${REPO5_URL}" "${REPO5_USERNAME}" "${REPO5_PASSWORD}" "${REPO5_INCLUDES}"
appendRepository "${REPO6_URL}" "${REPO6_USERNAME}" "${REPO6_PASSWORD}" "${REPO6_INCLUDES}"
appendRepository "${REPO7_URL}" "${REPO7_USERNAME}" "${REPO7_PASSWORD}" "${REPO7_INCLUDES}"
appendRepository "${REPO8_URL}" "${REPO8_USERNAME}" "${REPO8_PASSWORD}" "${REPO8_INCLUDES}"
appendRepository "${REPO9_URL}" "${REPO9_USERNAME}" "${REPO9_PASSWORD}" "${REPO9_INCLUDES}"
appendRepository "${REPO10_URL}" "${REPO10_USERNAME}" "${REPO10_PASSWORD}" "${REPO10_INCLUDES}"

echo "\"default\":\"${REPO_DEFAULT:-https://repo.maven.apache.org/maven2}\"}}" >> config.json

npm run start
