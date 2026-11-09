[CmdletBinding(DefaultParameterSetName = 'Search')]
param(
    [Parameter(Mandatory)]
    [string] $OutputDirectory,
    [Parameter(Mandatory, ParameterSetName = 'Search')]
    [switch] $Search,
    [Parameter(Mandatory, ParameterSetName = 'Prepare')]
    [string] $SelectionPath
)

$ErrorActionPreference = 'Stop'
$queries = @(
    'laptop on white desk', 'open laptop minimal desk', 'laptop closeup keyboard',
    'closed laptop on table', 'computer monitor on desk', 'monitor screen office desk',
    'black computer screen', 'hdmi cable', 'usb cable white background',
    'ethernet cable', 'webcam', 'compact camera on table'
)
$equipment = for ($i = 0; $i -lt $queries.Count; $i++) { 'TI-{0:0000}' -f ($i + 1) }

$destination = [IO.Path]::GetFullPath($OutputDirectory)
$repo = (Resolve-Path "$PSScriptRoot/../../../..").Path
$repoPrefix = $repo + [IO.Path]::DirectorySeparatorChar
if ($destination -eq $repo -or $destination.StartsWith($repoPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Use uma pasta de saída fora do repositório.'
}

$apiKey = $env:PIXABAY_API_KEY
if (-not $apiKey) {
    $apiKey = [Environment]::GetEnvironmentVariable('PIXABAY_API_KEY', 'User')
}
if (-not $apiKey) { throw 'PIXABAY_API_KEY não disponível no ambiente local.' }

function Get-PixabayData([string] $Query) {
    $cacheDir = Join-Path $destination 'cache'
    New-Item -ItemType Directory -Force $cacheDir | Out-Null
    $hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($Query)))
    $cached = Join-Path $cacheDir "$hash.json"
    if ((Test-Path -LiteralPath $cached) -and
        (Get-Item -LiteralPath $cached).LastWriteTimeUtc -gt [DateTime]::UtcNow.AddHours(-24)) {
        return Get-Content -Raw -LiteralPath $cached | ConvertFrom-Json
    }
    try {
        $key = [Uri]::EscapeDataString($apiKey)
        $result = Invoke-RestMethod -Uri "https://pixabay.com/api/?key=$key&$Query" -MaximumRedirection 0 -TimeoutSec 30
    } catch {
        $status = $_.Exception.Response.StatusCode
        if ($status) { throw "A API Pixabay respondeu com HTTP $([int] $status)." }
        throw 'Falha ao acessar a API Pixabay.'
    }
    ConvertTo-Json -InputObject $result -Depth 8 | Set-Content -LiteralPath $cached -Encoding utf8
    return $result
}

function Save-Json([string] $Path, $Data) {
    $json = ConvertTo-Json -InputObject $Data -Depth 8
    if ((Test-Path -LiteralPath $Path) -and (Get-Content -Raw -LiteralPath $Path).TrimEnd() -ceq $json.TrimEnd()) {
        return
    }
    Set-Content -LiteralPath $Path -Value $json -Encoding utf8
}

if ($Search) {
    $candidates = for ($i = 0; $i -lt $equipment.Count; $i++) {
        $query = [Uri]::EscapeDataString($queries[$i])
        $results = Get-PixabayData "q=$query&image_type=photo&orientation=horizontal&safesearch=true&per_page=15"
        [ordered]@{
            patrimonio = $equipment[$i]
            fotos = @($results.hits | ForEach-Object {
                [ordered]@{ id = $_.id; pagina = $_.pageURL; previa = $_.webformatURL; autor = $_.user }
            })
        }
    }
    New-Item -ItemType Directory -Force $destination | Out-Null
    Save-Json (Join-Path $destination 'candidatos.json') $candidates
    return
}

$selection = Get-Content -Raw -LiteralPath $SelectionPath | ConvertFrom-Json -AsHashtable
if ($selection.Count -ne $equipment.Count -or @($equipment | Where-Object {
    [string] $selection[$_] -notmatch '^[1-9][0-9]{0,14}$'
}).Count -or @($selection.Values | ForEach-Object { [string] $_ } | Sort-Object -Unique).Count -ne $equipment.Count) {
    throw 'A seleção precisa de um ID Pixabay distinto para cada um dos 12 patrimônios.'
}

Add-Type -AssemblyName System.Drawing.Common
function Save-Jpeg([byte[]] $Bytes, [string] $Path) {
    $stream = [IO.MemoryStream]::new($Bytes)
    try {
        $image = [Drawing.Image]::FromStream($stream)
        try {
            $bitmap = [Drawing.Bitmap]::new(800, 600)
            try {
                $graphics = [Drawing.Graphics]::FromImage($bitmap)
                try {
                    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $scale = [Math]::Max(800 / $image.Width, 600 / $image.Height)
                    $width = $image.Width * $scale
                    $height = $image.Height * $scale
                    $rect = [Drawing.RectangleF]::new((800 - $width) / 2, (600 - $height) / 2, $width, $height)
                    $graphics.DrawImage($image, $rect)
                    $bitmap.Save($Path, [Drawing.Imaging.ImageFormat]::Jpeg)
                } finally { $graphics.Dispose() }
            } finally { $bitmap.Dispose() }
        } finally { $image.Dispose() }
    } finally { $stream.Dispose() }
    $saved = [Drawing.Image]::FromFile($Path)
    try {
        if ($saved.Width -ne 800 -or $saved.Height -ne 600) { throw 'JPEG fora de 800×600.' }
    } finally { $saved.Dispose() }
}

$staging = Join-Path ([IO.Path]::GetTempPath()) ('empres-ti-fotos-' + [guid]::NewGuid())
New-Item -ItemType Directory $staging | Out-Null
try {
    $manifest = foreach ($asset in $equipment) {
        $result = Get-PixabayData "id=$($selection[$asset])&image_type=photo&safesearch=true"
        $photo = $result.hits | Select-Object -First 1
        $source = [Uri] $photo.largeImageURL
        $isImageHost = $source.Host -eq 'cdn.pixabay.com' -or
            ($source.Host -eq 'pixabay.com' -and $source.AbsolutePath.StartsWith('/get/'))
        if ($source.Scheme -ne 'https' -or -not $isImageHost -or
            [string] $photo.id -ne [string] $selection[$asset] -or -not $photo.user -or
            ([Uri] $photo.pageURL).Host -ne 'pixabay.com') {
            throw "Metadados Pixabay inválidos para $asset."
        }
        $response = Invoke-WebRequest -Uri $source -MaximumRedirection 0 -TimeoutSec 30
        $path = Join-Path $staging "$asset.jpg"
        Save-Jpeg $response.Content $path
        [ordered]@{
            patrimonio = $asset
            pixabayId = $photo.id
            pagina = $photo.pageURL
            origem = $source.AbsoluteUri
            autor = $photo.user
            perfilAutor = "https://pixabay.com/users/$($photo.user)-$($photo.user_id)/"
            licenca = 'https://pixabay.com/service/license-summary/'
            largura = 800
            altura = 600
            objeto = "equipamentos/$asset.jpg"
            sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
        }
    }

    if (@($manifest.sha256 | Sort-Object -Unique).Count -ne $equipment.Count) {
        throw 'O lote contém JPEGs idênticos.'
    }

    $imageDir = Join-Path $destination 'equipamentos'
    New-Item -ItemType Directory -Force $imageDir | Out-Null
    foreach ($entry in $manifest) {
        $target = Join-Path $destination $entry.objeto
        if (-not (Test-Path -LiteralPath $target) -or (Get-FileHash -LiteralPath $target).Hash -ne $entry.sha256) {
            Copy-Item -LiteralPath (Join-Path $staging "$($entry.patrimonio).jpg") -Destination $target -Force
        }
    }
    Save-Json (Join-Path $destination 'manifesto.json') $manifest
    Write-Output '12 JPEGs preparados. Revise visualmente os recortes antes do upload.'
} finally {
    $resolvedStaging = (Resolve-Path -LiteralPath $staging).Path
    if ($resolvedStaging -eq $staging) {
        Get-ChildItem -LiteralPath $resolvedStaging -File | Remove-Item -Force
        Remove-Item -LiteralPath $resolvedStaging -Force
    }
}
