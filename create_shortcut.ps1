$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\BrandApp.lnk")
$Shortcut.TargetPath = "$PWD\start.vbs"
$Shortcut.WorkingDirectory = "$PWD"
$Shortcut.Save()
