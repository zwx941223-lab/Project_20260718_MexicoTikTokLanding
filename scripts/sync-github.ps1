param(
  [Parameter(Mandatory = $true)]
  [string]$Commit
)

$ErrorActionPreference = "Stop"
$repoPath = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) { throw "无法定位 Git 仓库" }
$repo = "zwx941223-lab/Project_20260718_MexicoTikTokLanding"
$branch = "main"

$currentRemote = gh api "repos/$repo/git/ref/heads/$branch" --jq ".object.sha"
if ($LASTEXITCODE -ne 0) { throw "读取远端分支失败" }

$parent = git rev-parse "${Commit}^"
if ($LASTEXITCODE -ne 0) { throw "无法读取提交父节点" }
$paths = @(git diff-tree --no-commit-id --name-only -r $Commit)
if ($paths.Count -eq 0) { exit 0 }

function Get-GitBlobBytes([string]$revision, [string]$path) {
  $archive = Join-Path ([System.IO.Path]::GetTempPath()) ("git-sync-" + [guid]::NewGuid().ToString("N") + ".zip")
  $extract = Join-Path ([System.IO.Path]::GetTempPath()) ("git-sync-" + [guid]::NewGuid().ToString("N"))
  try {
    git archive --format=zip --output=$archive $revision -- $path
    if ($LASTEXITCODE -ne 0) { throw "读取提交文件失败: $path" }
    New-Item -ItemType Directory -Path $extract -Force | Out-Null
    [System.IO.Compression.ZipFile]::ExtractToDirectory($archive, $extract)
    return [System.IO.File]::ReadAllBytes((Join-Path $extract $path))
  } finally {
    Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $extract -Recurse -Force -ErrorAction SilentlyContinue
  }
}

foreach ($path in $paths) {
  $encodedPath = [System.Uri]::EscapeDataString($path).Replace("%2F", "/")
  $remoteFile = $null
  try {
    $remoteFile = gh api "repos/$repo/contents/$encodedPath?ref=$branch" | ConvertFrom-Json
  } catch {
    $remoteFile = $null
  }

  git cat-file -e "${parent}:$path" 2>$null
  $parentHasFile = ($LASTEXITCODE -eq 0)
  $parentBlob = $null
  if ($parentHasFile) {
    $parentBlob = git rev-parse "${parent}:$path"
  }
  if ($parentHasFile -and $remoteFile -and $parentBlob -ne $remoteFile.sha) {
    throw "远端文件已变化，未覆盖: $path"
  }

  git cat-file -e "${Commit}:$path" 2>$null
  $existsInCommit = $LASTEXITCODE
  if ($existsInCommit -eq 0) {
    $bytes = Get-GitBlobBytes $Commit $path
    $body = @{
      message = "Sync $Commit"
      content = [Convert]::ToBase64String($bytes)
      branch = $branch
    }
    if ($remoteFile) { $body.sha = $remoteFile.sha }
    $json = $body | ConvertTo-Json -Compress
    $result = $json | gh api --method PUT "repos/$repo/contents/$encodedPath" --input - --jq ".commit.sha"
  } elseif ($remoteFile) {
    $body = @{
      message = "Sync $Commit"
      sha = $remoteFile.sha
      branch = $branch
    } | ConvertTo-Json -Compress
    $result = $body | gh api --method DELETE "repos/$repo/contents/$encodedPath" --input - --jq ".commit.sha"
  } else {
    continue
  }
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($result)) {
    throw "同步文件失败: $path"
  }
}

$finalRemote = gh api "repos/$repo/git/ref/heads/$branch" --jq ".object.sha"
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($finalRemote)) {
  throw "同步后远端验证失败"
}
Write-Host "GitHub sync complete: $finalRemote"
