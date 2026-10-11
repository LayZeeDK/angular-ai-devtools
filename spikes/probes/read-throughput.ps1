# Reads a file sequentially with the Windows file cache bypassed (FILE_FLAG_NO_BUFFERING) and prints MB/s.
# Usage: pwsh -File read-throughput.ps1 <file> [megabytes]
param([string]$Path, [int]$Megabytes = 1024)

$noBuffering = [IO.FileOptions]0x20000000
$block = 4MB
$buffer = New-Object byte[] $block
$stream = New-Object IO.FileStream($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite, $block, $noBuffering)
$total = 0
$sw = [Diagnostics.Stopwatch]::StartNew()

try {
  while ($total -lt $Megabytes * 1MB) {
    $n = $stream.Read($buffer, 0, $block)

    if ($n -le 0) {
      break
    }

    $total += $n
  }
} finally {
  $stream.Dispose()
}

$sw.Stop()
'{0}: {1:N0} MB in {2:N2} s = {3:N0} MB/s' -f $Path, ($total / 1MB), $sw.Elapsed.TotalSeconds, (($total / 1MB) / $sw.Elapsed.TotalSeconds)
