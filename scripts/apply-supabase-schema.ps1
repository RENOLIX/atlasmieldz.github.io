param(
  [Parameter(Mandatory = $true)]
  [string]$AccessToken,

  [Parameter(Mandatory = $true)]
  [string]$ProjectRef,

  [string]$SchemaPath = "supabase/schema.sql"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SchemaPath)) {
  throw "Schema file not found: $SchemaPath"
}

$schema = Get-Content -LiteralPath $SchemaPath -Raw

$headers = @{
  Authorization = "Bearer $AccessToken"
  "Content-Type" = "application/json"
}

$body = @{
  query = $schema
} | ConvertTo-Json -Compress

$response = Invoke-WebRequest `
  -Method Post `
  -Headers $headers `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/database/query" `
  -Body $body `
  -UseBasicParsing

Write-Output "Schema applied successfully."
Write-Output "StatusCode: $($response.StatusCode)"
