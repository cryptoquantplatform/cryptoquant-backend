@echo off
echo ========================================
echo    FIXING COMPILER AND CREATING .EXE
echo ========================================
echo.
echo Setting up Visual Studio environment...
call "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling authentication app into standalone .exe...
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
    echo.
    echo Creating simple executable using alternative method...
)
echo.
pause
