param([string]$OutputDirectory = '', [string]$WebViewSdkDirectory = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$output = Join-Path $projectRoot 'Immersion Sound Windows'
if ($OutputDirectory) { $output = [IO.Path]::GetFullPath($OutputDirectory) }
$assets = Join-Path $output 'assets'
New-Item -ItemType Directory -Force -Path $output,$assets | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'immersion.ico') -Destination $output -Force
# Microsoft WebView2 SDK binaries already supplied by Microsoft Office on this PC.
$sdk = 'C:\Program Files\Microsoft Office\root\Office16\ADDINS\Microsoft Power Query for Excel Integrated\bin'
foreach ($name in @('Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.WinForms.dll','WebView2Loader.dll')) {
    $source = Join-Path $sdk $name
    if ($WebViewSdkDirectory) {
        $relative = if ($name -eq 'WebView2Loader.dll') { 'runtimes\win-x64\native\WebView2Loader.dll' } else { "lib\net45\$name" }
        $source = Join-Path $WebViewSdkDirectory $relative
    }
    Copy-Item -LiteralPath $source -Destination $output -Force
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'sphere-audio.js') -Destination $assets -Force
$html = [IO.File]::ReadAllText((Join-Path $projectRoot 'index.html'))
$html = $html.Replace('IMMERSION SOUND / PROTOTYPE 01', 'IMMERSION SOUND / WINDOWS')
$html = $html.Replace('Ouvre lancer-immersion.cmd pour utiliser Edge', 'Relance Immersion Sound')
$html = $html.Replace('Dans Edge, ouvre http://127.0.0.1:18765 puis autorise le microphone pour cette adresse.', "Autorise l’accès audio dans la fenêtre Immersion Sound.")
$html = $html.Replace('utilise lancer-immersion.cmd', 'relance Immersion Sound')
$html = $html.Replace('ouvre la démo à http://127.0.0.1:18765 dans Edge', 'relance Immersion Sound')
$html = $html.Replace('dans le navigateur', "dans l’application")
[IO.File]::WriteAllText((Join-Path $assets 'index.html'),$html,(New-Object Text.UTF8Encoding($false)))
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'ImmersionSound.exe.config'),(Join-Path $PSScriptRoot 'self-test.js') -Destination $output -Force
$compiler = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $compiler /nologo /target:winexe /platform:x64 /optimize+ /utf8output "/win32icon:$output\immersion.ico" "/out:$output\ImmersionSound.exe" /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll "/reference:$output\Microsoft.Web.WebView2.Core.dll" "/reference:$output\Microsoft.Web.WebView2.WinForms.dll" (Join-Path $PSScriptRoot 'ImmersionSound.cs')
if ($LASTEXITCODE -ne 0) { throw 'Compilation échouée.' }
Write-Output (Join-Path $output 'ImmersionSound.exe')
