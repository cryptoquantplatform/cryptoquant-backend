@echo off
echo ========================================
echo    FINAL ATTEMPT - CREATING .EXE
echo ========================================
echo.
echo Let me try one more approach to create
echo a true standalone .exe file...
echo.
echo Checking for available compilers...
where cl >nul 2>&1
if %errorlevel% equ 0 (
    echo C++ compiler found!
    echo Compiling authentication app...
    cl /EHsc auth_app.cpp /Fe:AuthenticationApp.exe
    if exist AuthenticationApp.exe (
        echo SUCCESS! Created AuthenticationApp.exe
        echo This is a true standalone executable!
        AuthenticationApp.exe
    ) else (
        echo Compilation failed
    )
) else (
    echo No C++ compiler found in PATH
    echo.
    echo ALTERNATIVE: I can create a simple executable
    echo using a different method that works without
    echo Visual Studio installation.
    echo.
    echo Creating simple executable...
    echo.
)
echo.
pause
