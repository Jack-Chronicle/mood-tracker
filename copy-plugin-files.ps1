# Only copy manifest.json (README.md is now optional)
$pluginDir = Join-Path $PSScriptRoot 'plugin'

# Ensure plugin directory exists
if (!(Test-Path $pluginDir)) {
    New-Item -ItemType Directory -Path $pluginDir | Out-Null
}

# Copy manifest.json
Copy-Item -Path (Join-Path $PSScriptRoot 'manifest.json') -Destination $pluginDir -Force
