@echo off
echo ========================================
echo    COMPILING KEYAUTH INTEGRATION
echo ========================================
echo.
echo Adding KeyAuth integration to the login system...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling KeyAuth integration...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:KeyAuthIntegrationLogin.exe /link d3d11.lib dxgi.lib wininet.lib winhttp.lib
echo.
if exist KeyAuthIntegrationLogin.exe (
    echo SUCCESS! Created KeyAuthIntegrationLogin.exe!
    echo This has KeyAuth integration!
    echo.
    echo File size:
    dir KeyAuthIntegrationLogin.exe
    echo.
    echo Running the KeyAuth integration login system...
    echo.
    echo Demo keys to test:
    echo - demo_key_123 (success)
    echo - test_key_456 (success)
    echo - expired_key (expired)
    echo - banned_key (banned)
    echo - any other key (invalid)
    echo.
    KeyAuthIntegrationLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
