@echo off
call "C:\Program Files\Microsoft Visual Studio\vcvarsall.bat" x64
cl /EHsc login_app.cpp /I. /Iexamples /Ibackends /link user32.lib gdi32.lib d3d11.lib dxgi.lib winhttp.lib /out:login_app_keyauth.exe
pause




