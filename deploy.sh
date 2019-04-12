#!/bin/bash
docker build -t welkinlan/lanyuerp-be .
docker push welkinlan/lanyuerp-be

ssh deploy@$DEPLOY_SERVER << EOF
docker pull welkinlan/lanyuerp-be
docker stop lanyuerp-be || true
docker rm lanyuerp-be || true
docker rmi welkinlan/lanyuerp-be:current || true
docker tag welkinlan/lanyuerp-be:latest welkinlan/lanyuerp-be:current
docker run -d --restart always --name lanyuerp-be -p 3000:3000 welkinlan/lanyuerp-be:current
EOF
