# One-time setup: grant your Firebase CI service account permission to deploy Firestore rules.
# Your GitHub Actions workflow already uses this account (TELEIOS_SITE secret) to deploy Firebase.
#
# Find the service account email:
#   Firebase Console → teleios-7bf72 → Project settings (gear) → Service accounts
#   Copy the email, e.g. firebase-adminsdk-xxxxx@teleios-7bf72.iam.gserviceaccount.com
#
# Grant roles via Firebase Console (no CLI needed):
#   Click "Manage service account permissions" on that page, then add:
#     - Firebase Admin                    (covers Rules deploy — fixes firebaserules 403)
#     - Service Usage Consumer            (fixes firestore API 403)
#     - Cloud Datastore Index Admin       (for firestore indexes)
#
# Or use this script if you have gcloud installed:
#   .\scripts\grant-ci-permissions.ps1 -ServiceAccount "firebase-adminsdk-xxxxx@teleios-7bf72.iam.gserviceaccount.com"

param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceAccount
)

$Project = "teleios-7bf72"

$Roles = @(
    "roles/firebase.admin",                     # required: deploy firestore.rules (fixes firebaserules 403)
    "roles/serviceusage.serviceUsageConsumer",  # required: check Firestore API status
    "roles/datastore.indexAdmin"                # required: deploy firestore.indexes.json
)

Write-Host "Granting CI permissions to $ServiceAccount on project $Project..." -ForegroundColor Cyan

foreach ($Role in $Roles) {
    Write-Host "  -> $Role"
    gcloud projects add-iam-policy-binding $Project `
        --member="serviceAccount:$ServiceAccount" `
        --role="$Role" `
        --condition=None `
        --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to grant $Role. Check gcloud auth and the service account email."
        exit 1
    }
}

Write-Host ""
Write-Host "Done. Re-run your GitHub Actions deploy — Firestore rules should deploy automatically." -ForegroundColor Green
