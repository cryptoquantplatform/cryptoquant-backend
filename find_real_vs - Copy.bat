@echo off
echo ========================================
echo    FINDING REAL VISUAL STUDIO BATCH FILE
echo ========================================
echo.
echo Looking for the real Visual Studio vcvarsall.bat...
echo.
for /r "C:\Program Files\Microsoft Visual Studio" %%i in (vcvarsall.bat) do (
    echo Found: %%i
    echo.
    echo This is the REAL Visual Studio batch file!
    echo.
    echo To fix the compiler, run this command:
    echo call "%%i" x64
    echo.
    echo Then I can compile the C++ code into a true .exe!
    echo.
    goto :found
)
echo No Visual Studio batch file found.
:found
echo.
pause
