#!/usr/bin/env bash
# One-time setup: grant the GitHub Actions service account permission to deploy Firestore rules.
#
# Prerequisites:
#   gcloud auth login && gcloud config set project teleios-7bf72
#
# Usage:
#   ./scripts/grant-ci-permissions.sh firebase-adminsdk-xxxxx@teleios-7bf72.iam.gserviceaccount.com
#
# Find the service account email in your TELEIOS_SITE GitHub secret JSON ("client_email").

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <service-account-email>"
  exit 1
fi

SERVICE_ACCOUNT="$1"
PROJECT="teleios-7bf72"

ROLES=(
  "roles/firebase.admin"
  "roles/serviceusage.serviceUsageConsumer"
  "roles/datastore.indexAdmin"
)

echo "Granting CI permissions to ${SERVICE_ACCOUNT} on project ${PROJECT}..."

for ROLE in "${ROLES[@]}"; do
  echo "  -> ${ROLE}"
  gcloud projects add-iam-policy-binding "${PROJECT}" \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="${ROLE}" \
    --condition=None \
    --quiet
done

echo ""
echo "Done. Re-run your GitHub Actions deploy."
