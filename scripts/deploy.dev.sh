#!/bin/bash
BUILD_MODE=
SERVICE=
LOG_JENKINS=
TELEGRAM_BOT_TOKEN=
TELEGRAM_GROUP_ID=
EV=
WORKSPACE=
while getopts "a:b:c:d:e:g:i:" opt
do
   # shellcheck disable=SC2220
   case "$opt" in
      a ) BUILD_MODE="$OPTARG" ;;
      b ) SERVICE="$OPTARG" ;;
      c ) LOG_JENKINS="$OPTARG" ;;
      d ) TELEGRAM_BOT_TOKEN="$OPTARG" ;;
      e ) TELEGRAM_GROUP_ID="$OPTARG" ;;
      g ) EV="$OPTARG" ;;
      i ) WORKSPACE="$OPTARG" ;;
   esac
done
SERVICE_UPPERCASE=`echo $SERVICE | tr 'a-z' 'A-Z'`
EV_UPPERCASE=`echo $EV | tr 'a-z' 'A-Z'`
function pushTelegramNotification() {
  echo $1
  echo $2
  echo $3
  if [ "$1" == "ERROR" ]; then
     MSG="❌ $SERVICE_UPPERCASE $2

$3"
  elif [ "$1" == "SUCCESS" ]; then
     MSG="✅ $SERVICE_UPPERCASE $2

$3"
  else
    MSG="🟡 $SERVICE_UPPERCASE $2

$3"
  fi
  echo $MSG
  MSG=${MSG//</(}
  MSG=${MSG//>/)}
  MSG=$(urlencode "$MSG")
  curl --location --request GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendmessage?chat_id=$TELEGRAM_GROUP_ID&parse_mode=HTML&text=<code>$MSG</code>"
    if [ "$1" == "ERROR" ]; then
      removeDeployEnv
      exit 1;
      fi
}

function removeDeployEnv() {
  rm -rf "${WORKSPACE}/.env.deploy"
}

urlencode() {
  python3 -c 'from urllib.parse import quote, sys; print(quote(sys.argv[1], sys.argv[2]))' \
    "$1" "$urlencode_safe"
}
TELEGRAM_MESSAGE="MODE: $EV_UPPERCASE
BUILD MODE: $BUILD_MODE
URL: $URL

- COMMIT INFO

BRANCH: $(git name-rev --name-only HEAD)
COMMIT: $(git log -2)"
pushTelegramNotification "DOING" " is being deployed" "$TELEGRAM_MESSAGE"
if [[ -n $(docker images --filter "dangling=false" -q --no-trunc) ]]
then
    docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
else
    echo "No dangling images"
fi
export $(egrep -v '^#' .env.deploy | xargs)

aws configure set aws_access_key_id $AWS_ACCESS_KEY
aws configure set aws_secret_access_key $AWS_SECRET_KEY
aws configure set default.region $AWS_REGION
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_FAMILY"
if [ "$?" -eq 0 ]; then
   echo "---AWS CONFIGURE DONE---"
else
  echo "---AWS CONFIGURE ERROR---"
  pushTelegramNotification "ERROR" "deployment errors: AWS CONFIGURE ERROR" "$TELEGRAM_MESSAGE"
fi
docker build -t "$PROJECT_NAME/$EV/$SERVICE" .
if [ "$?" -eq 0 ]; then
   echo "---DOCKER BUILD DONE---"
else
  echo "---DOCKER BUILD ERROR---"
  pushTelegramNotification "ERROR" "deployment error: DOCKER BUILD ERROR" "$TELEGRAM_MESSAGE"
fi
# deploy
if [ $? -eq 0 ]; then
  docker tag "$PROJECT_NAME/$EV/$SERVICE:latest" "$AWS_FAMILY/$PROJECT_NAME/$EV/$SERVICE:latest"
  docker push "$AWS_FAMILY/$PROJECT_NAME/$EV/$SERVICE:latest"
  aws ecs update-service --cluster "$PROJECT_NAME-$EV-$SERVICE-cluster" --service "$PROJECT_NAME-$EV-$SERVICE-service" --force-new-deployment --query 'service.deployments[0]'
  echo "---UPDATE FARGATE DONE---"
else
  echo "---UPDATE FARGATE ERROR---"
    pushTelegramNotification "ERROR" "deployment errors: UPDATE FARGATE ERROR" "$TELEGRAM_MESSAGE"
fi
removeDeployEnv
pushTelegramNotification "SUCCESS" "deployment successful" "$TELEGRAM_MESSAGE"