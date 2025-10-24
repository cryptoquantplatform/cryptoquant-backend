@echo off
echo ========================================
echo    COMPILING FIXED DRAGGABLE LOGIN
echo ========================================
echo.
echo Fixing the dragging with proper button approach...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling fixed draggable login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:FixedDraggableLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist FixedDraggableLogin.exe (
    echo SUCCESS! Created FixedDraggableLogin.exe!
    echo This should have working drag functionality!
    echo.
    echo File size:
    dir FixedDraggableLogin.exe
    echo.
    echo Running the fixed draggable login system...
    FixedDraggableLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
