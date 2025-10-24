@echo off
echo ========================================
echo   COMPILING FIXED INPUT FIELD
echo ========================================
echo.
echo Fixing the input field so you can type in it...

call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
cl /EHsc login_app.cpp /I. /Iexamples /Ibackends /link user32.lib gdi32.lib d3d11.lib dxgi.lib winhttp.lib /out:FixedInputLogin.exe

echo.
echo SUCCESS! Created FixedInputLogin.exe!
echo The input field should now work properly.
echo.
pause





