# Stops a per-model browser instance (by its profile folder under .browsers) and starts it again with the given features.
# Usage: pwsh -File relaunch-instance.ps1 <instance-name> <exe> <port> <features>
param([string]$Name, [string]$Exe, [int]$Port, [string]$Features)

$dir = "D:\projects\sandbox\angular-ai-devtools\.browsers\$Name"
$main = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match [regex]::Escape($dir) -and $_.CommandLine -notmatch '--type=' }

if ($main) {
  taskkill /PID $main.ProcessId /T /F | Out-Null
  Start-Sleep 3
}

$left = (Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match [regex]::Escape($dir) } | Measure-Object).Count

if ($left -ne 0) {
  throw "$left processes of $Name still running"
}

$p = Start-Process $Exe -ArgumentList "--user-data-dir=`"$dir`"", "--remote-debugging-port=$Port", '--no-first-run', '--no-default-browser-check', "--enable-features=$Features", 'about:blank' -PassThru
Start-Sleep 6
"$Name relaunched as PID $($p.Id) on port $Port"
