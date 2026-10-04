$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))) {
  Write-Host '首次运行，正在安装依赖……'
  npm install
}

npm run build
npm run preview
