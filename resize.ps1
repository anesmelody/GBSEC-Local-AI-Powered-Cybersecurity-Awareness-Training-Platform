Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\anasb\.gemini\antigravity-ide\brain\8744aa9a-bc94-4bf7-a20e-660a2e264500\gbsec_icon_1789033131065.jpg')
$sizes = @(16, 48, 128)
$outDir = 'C:\Users\anasb\.gemini\antigravity-ide\scratch\GBSEC\icons'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir }

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, $size, $size)
    $bmp.Save("$outDir\icon$size.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bmp.Dispose()
}
$img.Dispose()
