param([ValidateSet('film','fps','stadium','')][string]$Profile = '')
$ErrorActionPreference = 'Stop'
$immersionUrl = 'http://127.0.0.1:18765'
$immersionReady = $false
try {
    $immersionHealth = Invoke-WebRequest "$immersionUrl/health" -UseBasicParsing -TimeoutSec 2
    if ($immersionHealth.Content -ne 'immersion-sound-local-v1') { throw 'Le port local est utilise par une autre application.' }
    $immersionReady = $true
} catch {
    if ($_.Exception.Message -eq 'Le port local est utilise par une autre application.') { throw }
}
if (-not $immersionReady) {
    $immersionNode = (Get-Command node.exe -ErrorAction Stop).Source
    Start-Process -FilePath $immersionNode -ArgumentList ('"' + (Join-Path $PSScriptRoot 'server.cjs') + '"') -WindowStyle Hidden -WorkingDirectory $PSScriptRoot -RedirectStandardOutput (Join-Path $PSScriptRoot 'server.log') -RedirectStandardError (Join-Path $PSScriptRoot 'server-error.log')
    for ($immersionAttempt = 0; $immersionAttempt -lt 20; $immersionAttempt++) {
        Start-Sleep -Milliseconds 200
        try {
            $immersionHealth = Invoke-WebRequest "$immersionUrl/health" -UseBasicParsing -TimeoutSec 1
            if ($immersionHealth.Content -eq 'immersion-sound-local-v1') { $immersionReady = $true; break }
        } catch {}
    }
}
if (-not $immersionReady) { throw 'Le serveur audio local ne demarre pas. Voir server-error.log.' }
$immersionEdge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path -LiteralPath $immersionEdge)) { $immersionEdge = Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe' }
if ($Profile) { $immersionUrl += '/#' + $Profile }
Start-Process -FilePath $immersionEdge -ArgumentList '--new-window', $immersionUrl
