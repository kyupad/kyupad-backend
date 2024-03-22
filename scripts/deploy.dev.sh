#!/bin/bash
TELEGRAM_BOT_TOKEN=7086175399:AAEMiGynf3dqOPijjWLJCBAiyMJ3xTbYG1E
TELEGRAM_GROUP_ID=1436719030
function pushTelegramNotification() {
  curl --location --request GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendmessage?chat_id=$TELEGRAM_GROUP_ID&parse_mode=Markdown&text=$1"

}
pushTelegramNotification "longld"