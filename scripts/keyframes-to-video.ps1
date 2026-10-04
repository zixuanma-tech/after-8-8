param(
    [Parameter(Mandatory = $true)]
    [string]$KeyframeDir,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ffmpeg = Join-Path $root '.tools\env-liveportrait\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win64-v4.2.2.exe'
$resolved = (Resolve-Path -LiteralPath $KeyframeDir).Path
$sequence = Join-Path $resolved 'sequence'
New-Item -ItemType Directory -Force -Path $sequence | Out-Null

Copy-Item -LiteralPath (Join-Path $resolved 'start.png') -Destination (Join-Path $sequence '000.png') -Force
Copy-Item -LiteralPath (Join-Path $resolved 'mid.png') -Destination (Join-Path $sequence '001.png') -Force
Copy-Item -LiteralPath (Join-Path $resolved 'end.png') -Destination (Join-Path $sequence '002.png') -Force
Copy-Item -LiteralPath (Join-Path $resolved 'mid.png') -Destination (Join-Path $sequence '003.png') -Force
Copy-Item -LiteralPath (Join-Path $resolved 'start.png') -Destination (Join-Path $sequence '004.png') -Force

$outputParent = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $outputParent | Out-Null

& $ffmpeg -y -framerate 1.25 -i (Join-Path $sequence '%03d.png') `
    -vf 'minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1280:720:flags=lanczos,format=yuv420p' `
    -an -c:v libx264 -preset slow -crf 18 -movflags +faststart $OutputPath

if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg failed with exit code $LASTEXITCODE"
}
