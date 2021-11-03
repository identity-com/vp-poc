#!/usr/bin/env bash
set -e
set -u

if [ "${STAGE}" == "prod" ]; then
  DISTRIBUTION=E11UO6TBB0T7KQ
  BUCKET=vp-demo.identity.com
fi

npx deploy-aws-s3-cloudfront --non-interactive --source dist --bucket ${BUCKET} --destination ${STAGE} --distribution ${DISTRIBUTION}
