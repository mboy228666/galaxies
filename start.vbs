Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c npx electron .", 0
Set WshShell = Nothing
