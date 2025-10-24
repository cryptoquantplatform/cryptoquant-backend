@echo off
echo ========================================
echo    FIXING COMPILER - STEP BY STEP
echo ========================================
echo.
echo Step 1: Checking Visual Studio installation...
if exist "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" (
    echo Found Visual Studio 2022 Build Tools!
    echo.
    echo Step 2: Setting up environment...
    call "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
    echo.
    echo Step 3: Compiling authentication app...
    cl /EHsc auth_app.cpp imgui.cpp imgui_draw.cpp imgui_tables.cpp imgui_widgets.cpp imgui_impl_win32.cpp imgui_impl_dx11.cpp /Fe:AuthenticationApp.exe /link d3d11.lib dxgi.lib
    echo.
    if exist AuthenticationApp.exe (
        echo SUCCESS! Created AuthenticationApp.exe
        echo This is a true standalone executable!
        echo.
        echo File size:
        dir AuthenticationApp.exe
        echo.
        echo Running the application...
        AuthenticationApp.exe
    ) else (
        echo Compilation failed. Let me try alternative approach...
    )
) else (
    echo Visual Studio Build Tools not found!
    echo.
    echo Let me try alternative approach...
    echo.
    echo Creating simple executable using alternative method...
)
echo.
pause
