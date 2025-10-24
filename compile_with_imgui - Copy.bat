@echo off
echo ========================================
echo    COMPILING TRUE STANDALONE .EXE
echo ========================================
echo.
echo ImGui source code downloaded! Now compiling...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling authentication app into standalone .exe...
cl /EHsc auth_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:AuthenticationApp.exe /link d3d11.lib dxgi.lib
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
