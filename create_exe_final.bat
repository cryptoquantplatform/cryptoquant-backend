@echo off
echo ========================================
echo    CREATING TRUE STANDALONE .EXE
echo ========================================
echo.
echo Let me try a different approach to create
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
    echo Let me try to manually set up the environment...
    echo.
    set "PATH=C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64;%PATH%"
    set "INCLUDE=C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\include;%INCLUDE%"
    set "LIB=C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\lib\x64;%LIB%"
    echo.
    echo Environment manually set up! Now compiling...
    cl /EHsc auth_app.cpp /Fe:AuthenticationApp.exe
    if exist AuthenticationApp.exe (
        echo SUCCESS! Created AuthenticationApp.exe
        echo This is a true standalone executable!
        AuthenticationApp.exe
    ) else (
        echo Compilation failed. Let me try alternative method...
        echo.
        echo Creating simple executable using alternative method...
    )
)
echo.
pause
