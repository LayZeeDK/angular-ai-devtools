# Samples GPU-engine utilization (3D, compute, NPU engines show up here) and CPU time for processes whose command line matches a pattern.
# Usage: pwsh -File engine-sampler.ps1 <pattern> <seconds>
param([string]$Pattern, [int]$Seconds = 60)

$pids = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match [regex]::Escape($Pattern) } | ForEach-Object { $_.ProcessId }
$cpuBefore = @{}
$pids | ForEach-Object { $cpuBefore[$_] = (Get-Process -Id $_ -ErrorAction SilentlyContinue).CPU }
$engines = @{}
$end = (Get-Date).AddSeconds($Seconds)

while ((Get-Date) -lt $end) {
  $samples = (Get-Counter '\GPU Engine(*)\Utilization Percentage' -SampleInterval 2 -MaxSamples 1 -ErrorAction SilentlyContinue).CounterSamples | Where-Object { $_.CookedValue -gt 5 }

  foreach ($s in $samples) {
    $sp = [int][regex]::Match($s.InstanceName, 'pid_(\d+)').Groups[1].Value

    if ($pids -contains $sp) {
      $eng = ($s.InstanceName -replace '.*engtype_', '')
      $adapter = [regex]::Match($s.InstanceName, 'luid_(0x[0-9A-Fa-f]+_0x[0-9A-Fa-f]+)').Groups[1].Value
      $key = "$eng@$adapter"
      $engines[$key] = [math]::Max(($engines[$key] ?? 0), [math]::Round($s.CookedValue))
    }
  }
}

$cpu = ($pids | ForEach-Object { ((Get-Process -Id $_ -ErrorAction SilentlyContinue).CPU ?? 0) - ($cpuBefore[$_] ?? 0) } | Measure-Object -Sum).Sum
'busiest engines (max %): ' + ((($engines.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', ') -replace '^$', 'none above 5%')
'CPU-seconds: {0:N1}' -f $cpu
