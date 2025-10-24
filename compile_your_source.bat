@echo off
echo ========================================
echo    COMPILING YOUR ORIGINAL SOURCE
echo ========================================
echo.
echo Using your original ImGui source code...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling your source...
echo.
echo Compiling your original authentication app...
cl /EHsc auth_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:AuthenticationApp.exe /link d3d11.lib dxgi.lib
echo.
if exist AuthenticationApp.exe (
    echo SUCCESS! Created AuthenticationApp.exe from your source!
    echo This is a true standalone executable!
    echo.
    echo File size:
    dir AuthenticationApp.exe
    echo.
    echo Running your application...
    AuthenticationApp.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
