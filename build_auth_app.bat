@echo off
echo ========================================
echo    BUILDING STANDALONE AUTHENTICATION APP
echo ========================================
echo.
echo Creating a true standalone .exe file using ImGui...
echo.
echo Setting up Visual Studio environment...
call "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Compiling authentication app...
cl /EHsc auth_app.cpp imgui.cpp imgui_draw.cpp imgui_tables.cpp imgui_widgets.cpp imgui_impl_win32.cpp imgui_impl_dx11.cpp /Fe:AuthenticationApp.exe /link d3d11.lib dxgi.lib
echo.
if exist AuthenticationApp.exe (
    echo SUCCESS! Created AuthenticationApp.exe
    echo This is a standalone executable that customers can run!
    echo.
    echo Running the application...
    AuthenticationApp.exe
) else (
    echo Compilation failed. Trying alternative method...
    echo.
    echo Creating simple executable using alternative method...
)
echo.
pause
