param(
    [ValidateSet('female-01','female-02','female-03','female-04','female-05','female-06','female-07','female-08','male-01','male-02','male-03','male-04','male-05','male-06','male-07','male-08')]
    [string]$Only,
    [string]$SourceRoot,
    [string]$OutputRoot,
    [string]$WorkRoot,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ffmpeg = Join-Path $root '.tools\env-svd-xpu\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
$rifeRoot = Join-Path $root '.tools\rife-ncnn-vulkan\rife-ncnn-vulkan-20221029-windows'
$rife = Join-Path $rifeRoot 'rife-ncnn-vulkan.exe'
$model = Join-Path $rifeRoot 'rife-v4.6'
$workRoot = if ($WorkRoot) { $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($WorkRoot) } else { Join-Path $root '.tools\motion-prep' }
$outputRoot = if ($OutputRoot) { $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputRoot) } else { Join-Path $root '.tools\motion-ready' }
$sourceOverride = if ($SourceRoot) { $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($SourceRoot) } else { $null }
New-Item -ItemType Directory -Force -Path $workRoot, $outputRoot | Out-Null

$clips = foreach ($gender in @('female', 'male')) {
    foreach ($shot in 1..8) {
        '{0}-{1:d2}' -f $gender, $shot
    }
}
if ($Only) {
    $clips = @($Only)
}

foreach ($clip in $clips) {
    $destination = Join-Path $outputRoot "$clip.mp4"
    if ((Test-Path -LiteralPath $destination) -and -not $Force) {
        Write-Output "SKIP $clip"
        continue
    }

    $isWan = $clip -in @('female-01', 'female-07')
    $clipSourceRoot = if ($sourceOverride) { $sourceOverride } elseif ($isWan) { Join-Path $root '.tools\full-motion-generated' } else { Join-Path $root '.tools\svd-generated' }
    $source = Join-Path $clipSourceRoot "$clip.mp4"
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Missing source: $source"
    }

    $clipWork = Join-Path $workRoot $clip
    $inputFrames = Join-Path $clipWork 'input'
    $interpolatedFrames = Join-Path $clipWork 'interpolated'
    New-Item -ItemType Directory -Force -Path $inputFrames, $interpolatedFrames | Out-Null
    Write-Output "START $clip"

    if ($clip -eq 'female-01') {
        & $ffmpeg -y -i $source -t 1.75 (Join-Path $inputFrames '%08d.png') 2>$null
    }
    else {
        & $ffmpeg -y -i $source (Join-Path $inputFrames '%08d.png') 2>$null
    }
    if ($LASTEXITCODE -ne 0) { throw "Frame extraction failed: $clip" }

    $inputCount = (Get-ChildItem -LiteralPath $inputFrames -Filter '*.png').Count
    $targetCount = if ($isWan) { $inputCount * 2 - 1 } else { ($inputCount - 1) * 4 + 1 }
    & $rife -i $inputFrames -o $interpolatedFrames -n $targetCount -m $model -g 0 -j '2:2:2'
    if ($LASTEXITCODE -ne 0) { throw "RIFE interpolation failed: $clip" }

    $fps = if ($isWan) { 32 } else { 28 }
    & $ffmpeg -y -framerate $fps -start_number 0 -i (Join-Path $interpolatedFrames '%08d.png') `
        -vf 'scale=1280:720:flags=lanczos,format=yuv420p' -an -c:v libx264 -preset slow -crf 19 `
        -movflags +faststart $destination 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Video encoding failed: $clip" }
    Write-Output "DONE $clip ($inputCount -> $targetCount frames at $fps fps)"
}
