@echo off
echo ========================================
echo    LOCATING VISUAL STUDIO BATCH FILE
echo ========================================
echo.
echo Searching for vcvarsall.bat...
echo.
for /r "C:\Program Files" %%i in (vcvarsall.bat) do (
    echo Found: %%i
    echo.
    echo To fix the compiler, run this command:
    echo call "%%i" x64
    echo.
    echo Then I can compile the C++ code into a true .exe!
    echo.
)
echo.
pause
