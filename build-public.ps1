$ErrorActionPreference = 'Stop'
$cache = Join-Path $PSScriptRoot '.cache'
New-Item -ItemType Directory -Force $cache | Out-Null
$zip = Join-Path $cache 'webview2.zip'
$url = 'https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/1.0.2365.46/microsoft.web.webview2.1.0.2365.46.nupkg'
if (-not (Test-Path -LiteralPath $zip)) { Invoke-WebRequest $url -OutFile $zip }
$expected = '1B0146D842344B8462520FB38AD8EFF46E52031C19B955376C227BEC619FAEFD'
if ((Get-FileHash $zip -Algorithm SHA256).Hash -ne $expected) { throw 'SDK checksum mismatch' }
$sdk = Join-Path $cache 'webview2'
Expand-Archive -LiteralPath $zip -DestinationPath $sdk -Force
& (Join-Path $PSScriptRoot 'windows-app/build.ps1') -WebViewSdkDirectory $sdk
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
Copy-Item -LiteralPath (Join-Path $sdk 'LICENSE.txt') -Destination (Join-Path $PSScriptRoot 'Immersion Sound Windows/WebView2-LICENSE.txt')
