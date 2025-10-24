// Configuration Panel - ImGui DirectX11 Implementation
// Based on the original ImGui example, customized for the configuration interface

#include "imgui.h"
#include "imgui_impl_win32.h"
#include "imgui_impl_dx11.h"
#include <d3d11.h>
#include <tchar.h>
#include <string>

// Data
static ID3D11Device*            g_pd3dDevice = nullptr;
static ID3D11DeviceContext*     g_pd3dDeviceContext = nullptr;
static IDXGISwapChain*          g_pSwapChain = nullptr;
static bool                     g_SwapChainOccluded = false;
static UINT                     g_ResizeWidth = 0, g_ResizeHeight = 0;
static ID3D11RenderTargetView*  g_mainRenderTargetView = nullptr;

// Configuration app state
static bool show_config_window = true;
static int selected_tab = 0;

// Forward declarations of helper functions
bool CreateDeviceD3D(HWND hWnd);
void CleanupDeviceD3D();
void CreateRenderTarget();
void CleanupRenderTarget();
LRESULT WINAPI WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam);

// Custom ImGui styling to match the configuration panel
void SetupCustomStyle()
{
    ImGuiStyle& style = ImGui::GetStyle();
    
    // Professional dark theme with blue accents
    style.Colors[ImGuiCol_WindowBg] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_ChildBg] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_PopupBg] = ImVec4(0.08f, 0.08f, 0.08f, 0.95f);
    style.Colors[ImGuiCol_Border] = ImVec4(0.0f, 0.5f, 1.0f, 0.3f);
    style.Colors[ImGuiCol_BorderShadow] = ImVec4(0.0f, 0.0f, 0.0f, 0.0f);
    style.Colors[ImGuiCol_FrameBg] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_FrameBgHovered] = ImVec4(0.20f, 0.20f, 0.20f, 1.0f);
    style.Colors[ImGuiCol_FrameBgActive] = ImVec4(0.25f, 0.25f, 0.25f, 1.0f);
    style.Colors[ImGuiCol_TitleBg] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_TitleBgActive] = ImVec4(0.0f, 0.3f, 0.8f, 1.0f);
    style.Colors[ImGuiCol_TitleBgCollapsed] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_MenuBarBg] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarBg] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarGrab] = ImVec4(0.3f, 0.3f, 0.3f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarGrabHovered] = ImVec4(0.4f, 0.4f, 0.4f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarGrabActive] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_CheckMark] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_SliderGrab] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_SliderGrabActive] = ImVec4(0.0f, 0.6f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_Button] = ImVec4(0.0f, 0.4f, 0.8f, 1.0f);
    style.Colors[ImGuiCol_ButtonHovered] = ImVec4(0.0f, 0.5f, 0.9f, 1.0f);
    style.Colors[ImGuiCol_ButtonActive] = ImVec4(0.0f, 0.3f, 0.7f, 1.0f);
    style.Colors[ImGuiCol_Header] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_HeaderHovered] = ImVec4(0.20f, 0.20f, 0.20f, 1.0f);
    style.Colors[ImGuiCol_HeaderActive] = ImVec4(0.25f, 0.25f, 0.25f, 1.0f);
    style.Colors[ImGuiCol_Separator] = ImVec4(0.3f, 0.3f, 0.3f, 1.0f);
    style.Colors[ImGuiCol_SeparatorHovered] = ImVec4(0.4f, 0.4f, 0.4f, 1.0f);
    style.Colors[ImGuiCol_SeparatorActive] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_ResizeGrip] = ImVec4(0.3f, 0.3f, 0.3f, 1.0f);
    style.Colors[ImGuiCol_ResizeGripHovered] = ImVec4(0.4f, 0.4f, 0.4f, 1.0f);
    style.Colors[ImGuiCol_ResizeGripActive] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_Tab] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_TabHovered] = ImVec4(0.20f, 0.20f, 0.20f, 1.0f);
    style.Colors[ImGuiCol_TabActive] = ImVec4(0.0f, 0.4f, 0.8f, 1.0f);
    style.Colors[ImGuiCol_TabUnfocused] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_TabUnfocusedActive] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_PlotLines] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_PlotLinesHovered] = ImVec4(0.0f, 0.6f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_PlotHistogram] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_PlotHistogramHovered] = ImVec4(0.0f, 0.6f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_Text] = ImVec4(0.95f, 0.95f, 0.95f, 1.0f);
    style.Colors[ImGuiCol_TextDisabled] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_TextSelectedBg] = ImVec4(0.0f, 0.4f, 0.8f, 0.3f);
    style.Colors[ImGuiCol_DragDropTarget] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_NavHighlight] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_NavWindowingHighlight] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_NavWindowingDimBg] = ImVec4(0.0f, 0.0f, 0.0f, 0.5f);
    style.Colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.0f, 0.0f, 0.0f, 0.5f);
    
    // Modern rounded corners
    style.WindowRounding = 12.0f;
    style.ChildRounding = 8.0f;
    style.FrameRounding = 6.0f;
    style.PopupRounding = 8.0f;
    style.ScrollbarRounding = 6.0f;
    style.GrabRounding = 6.0f;
    style.TabRounding = 6.0f;
    
    // Professional spacing
    style.WindowPadding = ImVec2(0, 0);
    style.FramePadding = ImVec2(12, 8);
    style.ItemSpacing = ImVec2(12, 8);
    style.ItemInnerSpacing = ImVec2(8, 6);
    style.IndentSpacing = 20.0f;
    style.ScrollbarSize = 16.0f;
    style.GrabMinSize = 12.0f;
    
    // Window styling
    style.WindowBorderSize = 0.0f;
    style.ChildBorderSize = 1.0f;
    style.PopupBorderSize = 1.0f;
    style.FrameBorderSize = 0.0f;
    style.TabBorderSize = 0.0f;
}

// Main code
int main(int, char**)
{
    // Make process DPI aware and obtain main monitor scale
    ImGui_ImplWin32_EnableDpiAwareness();
    float main_scale = ImGui_ImplWin32_GetDpiScaleForMonitor(::MonitorFromPoint(POINT{ 0, 0 }, MONITOR_DEFAULTTOPRIMARY));

    // Create application window
    WNDCLASSEXW wc = { sizeof(wc), CS_CLASSDC, WndProc, 0L, 0L, GetModuleHandle(nullptr), nullptr, nullptr, nullptr, nullptr, L"Configuration Panel", nullptr };
    ::RegisterClassExW(&wc);
    HWND hwnd = ::CreateWindowW(wc.lpszClassName, L"Configuration Panel", WS_OVERLAPPEDWINDOW, 100, 100, 1200, 800, nullptr, nullptr, wc.hInstance, nullptr);

    // Initialize Direct3D
    if (!CreateDeviceD3D(hwnd))
    {
        CleanupDeviceD3D();
        ::UnregisterClassW(wc.lpszClassName, wc.hInstance);
        return 1;
    }

    // Show the window
    ::ShowWindow(hwnd, SW_SHOWDEFAULT);
    ::UpdateWindow(hwnd);

    // Setup Dear ImGui context
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO(); (void)io;
    io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;

    // Setup Dear ImGui style
    ImGui::StyleColorsDark();
    SetupCustomStyle();

    // Setup scaling
    ImGuiStyle& style = ImGui::GetStyle();
    style.ScaleAllSizes(main_scale);
    style.FontScaleDpi = main_scale;

    // Setup Platform/Renderer backends
    ImGui_ImplWin32_Init(hwnd);
    ImGui_ImplDX11_Init(g_pd3dDevice, g_pd3dDeviceContext);

    // Our state
    ImVec4 clear_color = ImVec4(0.08f, 0.08f, 0.08f, 1.00f);

    // Main loop
    bool done = false;
    while (!done)
    {
        // Poll and handle messages
        MSG msg;
        while (::PeekMessage(&msg, nullptr, 0U, 0U, PM_REMOVE))
        {
            ::TranslateMessage(&msg);
            ::DispatchMessage(&msg);
            if (msg.message == WM_QUIT)
                done = true;
        }
        if (done)
            break;

        // Handle window being minimized or screen locked
        if (g_SwapChainOccluded && g_pSwapChain->Present(0, DXGI_PRESENT_TEST) == DXGI_STATUS_OCCLUDED)
        {
            ::Sleep(10);
            continue;
        }
        g_SwapChainOccluded = false;

        // Handle window resize
        if (g_ResizeWidth != 0 && g_ResizeHeight != 0)
        {
            CleanupRenderTarget();
            g_pSwapChain->ResizeBuffers(0, g_ResizeWidth, g_ResizeHeight, DXGI_FORMAT_UNKNOWN, 0);
            g_ResizeWidth = g_ResizeHeight = 0;
            CreateRenderTarget();
        }

        // Start the Dear ImGui frame
        ImGui_ImplDX11_NewFrame();
        ImGui_ImplWin32_NewFrame();
        ImGui::NewFrame();

        // Create the configuration interface
        {
            // Set window to fill the entire screen
            ImGui::SetNextWindowPos(ImVec2(0, 0));
            ImGui::SetNextWindowSize(ImVec2(1200, 800));
            ImGui::SetNextWindowBgAlpha(1.0f);

            ImGui::Begin("Configuration Panel", &show_config_window, 
                ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize | 
                ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoScrollbar);

            // Left navigation panel
            ImGui::BeginChild("Navigation", ImVec2(200, 800), true);
            
            // Navigation items
            const char* nav_items[] = {"Combat", "Entities", "Colors", "Environment", "Radar", "Misc"};
            
            for (int i = 0; i < 6; i++)
            {
                ImGui::PushID(i);
                if (ImGui::Button(nav_items[i], ImVec2(-1, 40)))
                {
                    selected_tab = i;
                }
                ImGui::PopID();
            }
            
            ImGui::EndChild();

            // Main content area
            ImGui::SameLine();
            ImGui::BeginChild("MainContent", ImVec2(1000, 800), true);
            
            // Header
            ImGui::Text("noctra.live - 14:42 - 18.10.2025");
            ImGui::Separator();
            ImGui::Dummy(ImVec2(0, 20));

            // Combat Settings
            if (selected_tab == 0)
            {
                // Aimbot Section
                ImGui::Text("Aimbot");
                ImGui::Separator();
                
                static bool enable_aimbot = true;
                static bool enable_targeting_prediction = true;
                static int aim_type = 0;
                const char* aim_types[] = {"Memory aim", "Silent aim", "Legit aim"};
                
                ImGui::Checkbox("Enable Aimbot", &enable_aimbot);
                ImGui::Checkbox("Enable Targeting prediction", &enable_targeting_prediction);
                ImGui::Combo("aim type", &aim_type, aim_types, 3);
                
                ImGui::Text("Primary keybind: Right Mouse");
                ImGui::Text("Secondary keybind: F7");
                
                ImGui::Dummy(ImVec2(0, 20));
                
                // Configuration Section
                ImGui::Text("Configuration");
                ImGui::Separator();
                
                static bool use_weapon_config = true;
                static int hitbox = 0;
                const char* hitboxes[] = {"Head", "Neck", "Chest", "Stomach"};
                static float fov_radius = 150.0f;
                static float smoothness = 10.0f;
                
                ImGui::Checkbox("Use Weapon Configuration", &use_weapon_config);
                ImGui::Combo("Hitbox", &hitbox, hitboxes, 4);
                ImGui::SliderFloat("FOV Radius", &fov_radius, 0.0f, 360.0f);
                ImGui::SliderFloat("Smoothness", &smoothness, 0.0f, 100.0f);
                
                ImGui::Dummy(ImVec2(0, 20));
                
                // Rendering Section
                ImGui::Text("Rendering");
                ImGui::Separator();
                
                static bool draw_fov_circle = true;
                static bool fov_outline = true;
                static bool draw_target_line = true;
                static bool draw_target_head = true;
                static bool draw_target_text = true;
                static bool draw_prediction_dot = true;
                static bool draw_indicators = true;
                
                ImGui::Checkbox("Draw FOV circle", &draw_fov_circle);
                ImGui::Checkbox("Fov outline", &fov_outline);
                ImGui::Checkbox("Draw Target Line", &draw_target_line);
                ImGui::Checkbox("Draw Target Head", &draw_target_head);
                ImGui::Checkbox("Draw Target Text", &draw_target_text);
                ImGui::Checkbox("Draw Prediction Dot", &draw_prediction_dot);
                ImGui::Checkbox("Draw Indicators", &draw_indicators);
                
                ImGui::Dummy(ImVec2(0, 20));
                
                // Other Section
                ImGui::Text("Other");
                ImGui::Separator();
                
                static bool aim_curve = true;
                static bool humanization = true;
                
                ImGui::Checkbox("Aim curve ?", &aim_curve);
                ImGui::Checkbox("Humanization ?", &humanization);
                
                ImGui::Dummy(ImVec2(0, 20));
                
                // Filters Section
                ImGui::Text("Filters");
                ImGui::Separator();
                
                static bool visible_check = true;
                static bool use_raycasting = true;
                static bool ignore_knocked = true;
                static bool ignore_team = true;
                static bool ignore_pickaxe = true;
                static bool ignore_npc = true;
                static bool ignore_npc_by_username = true;
                static bool ignore_while_building = true;
                
                ImGui::Checkbox("Visible Check", &visible_check);
                ImGui::Checkbox("Use Raycasting", &use_raycasting);
                ImGui::Checkbox("Ignore Knocked", &ignore_knocked);
                ImGui::Checkbox("Ignore Team", &ignore_team);
                ImGui::Checkbox("Ignore Pickaxe", &ignore_pickaxe);
                ImGui::Checkbox("Ignore NPC", &ignore_npc);
                ImGui::Checkbox("Ignore NPC By Username", &ignore_npc_by_username);
                ImGui::Checkbox("Ignore while building", &ignore_while_building);
                
                ImGui::Dummy(ImVec2(0, 20));
                
                // Triggerbot Section
                ImGui::Text("Triggerbot");
                ImGui::Separator();
                
                static bool enable_triggerbot = true;
                ImGui::Checkbox("Enable Triggerbot", &enable_triggerbot);
            }
            else if (selected_tab == 1)
            {
                ImGui::Text("Entities Settings");
                ImGui::Separator();
                ImGui::Text("Entity configuration options will be here...");
            }
            else if (selected_tab == 2)
            {
                ImGui::Text("Colors Settings");
                ImGui::Separator();
                ImGui::Text("Color configuration options will be here...");
            }
            else if (selected_tab == 3)
            {
                ImGui::Text("Environment Settings");
                ImGui::Separator();
                ImGui::Text("Environment configuration options will be here...");
            }
            else if (selected_tab == 4)
            {
                ImGui::Text("Radar Settings");
                ImGui::Separator();
                ImGui::Text("Radar configuration options will be here...");
            }
            else if (selected_tab == 5)
            {
                ImGui::Text("Misc Settings");
                ImGui::Separator();
                ImGui::Text("Miscellaneous configuration options will be here...");
            }

            ImGui::EndChild();

            ImGui::End();
        }

        // Rendering
        ImGui::Render();
        const float clear_color_with_alpha[4] = { clear_color.x * clear_color.w, clear_color.y * clear_color.w, clear_color.z * clear_color.w, clear_color.w };
        g_pd3dDeviceContext->OMSetRenderTargets(1, &g_mainRenderTargetView, nullptr);
        g_pd3dDeviceContext->ClearRenderTargetView(g_mainRenderTargetView, clear_color_with_alpha);
        ImGui_ImplDX11_RenderDrawData(ImGui::GetDrawData());

        // Present
        HRESULT hr = g_pSwapChain->Present(1, 0);
        g_SwapChainOccluded = (hr == DXGI_STATUS_OCCLUDED);
    }

    // Cleanup
    ImGui_ImplDX11_Shutdown();
    ImGui_ImplWin32_Shutdown();
    ImGui::DestroyContext();

    CleanupDeviceD3D();
    ::DestroyWindow(hwnd);
    ::UnregisterClassW(wc.lpszClassName, wc.hInstance);

    return 0;
}

// Helper functions (same as original example)
bool CreateDeviceD3D(HWND hWnd)
{
    DXGI_SWAP_CHAIN_DESC sd;
    ZeroMemory(&sd, sizeof(sd));
    sd.BufferCount = 2;
    sd.BufferDesc.Width = 0;
    sd.BufferDesc.Height = 0;
    sd.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    sd.BufferDesc.RefreshRate.Numerator = 60;
    sd.BufferDesc.RefreshRate.Denominator = 1;
    sd.Flags = DXGI_SWAP_CHAIN_FLAG_ALLOW_MODE_SWITCH;
    sd.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
    sd.OutputWindow = hWnd;
    sd.SampleDesc.Count = 1;
    sd.SampleDesc.Quality = 0;
    sd.Windowed = TRUE;
    sd.SwapEffect = DXGI_SWAP_EFFECT_DISCARD;

    UINT createDeviceFlags = 0;
    D3D_FEATURE_LEVEL featureLevel;
    const D3D_FEATURE_LEVEL featureLevelArray[2] = { D3D_FEATURE_LEVEL_11_0, D3D_FEATURE_LEVEL_10_0, };
    HRESULT res = D3D11CreateDeviceAndSwapChain(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, createDeviceFlags, featureLevelArray, 2, D3D11_SDK_VERSION, &sd, &g_pSwapChain, &g_pd3dDevice, &featureLevel, &g_pd3dDeviceContext);
    if (res == DXGI_ERROR_UNSUPPORTED)
        res = D3D11CreateDeviceAndSwapChain(nullptr, D3D_DRIVER_TYPE_WARP, nullptr, createDeviceFlags, featureLevelArray, 2, D3D11_SDK_VERSION, &sd, &g_pSwapChain, &g_pd3dDevice, &featureLevel, &g_pd3dDeviceContext);
    if (res != S_OK)
        return false;

    CreateRenderTarget();
    return true;
}

void CleanupDeviceD3D()
{
    CleanupRenderTarget();
    if (g_pSwapChain) { g_pSwapChain->Release(); g_pSwapChain = nullptr; }
    if (g_pd3dDeviceContext) { g_pd3dDeviceContext->Release(); g_pd3dDeviceContext = nullptr; }
    if (g_pd3dDevice) { g_pd3dDevice->Release(); g_pd3dDevice = nullptr; }
}

void CreateRenderTarget()
{
    ID3D11Texture2D* pBackBuffer;
    g_pSwapChain->GetBuffer(0, IID_PPV_ARGS(&pBackBuffer));
    g_pd3dDevice->CreateRenderTargetView(pBackBuffer, nullptr, &g_mainRenderTargetView);
    pBackBuffer->Release();
}

void CleanupRenderTarget()
{
    if (g_mainRenderTargetView) { g_mainRenderTargetView->Release(); g_mainRenderTargetView = nullptr; }
}

extern IMGUI_IMPL_API LRESULT ImGui_ImplWin32_WndProcHandler(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam);

LRESULT WINAPI WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    if (ImGui_ImplWin32_WndProcHandler(hWnd, msg, wParam, lParam))
        return true;

    switch (msg)
    {
    case WM_SIZE:
        if (wParam == SIZE_MINIMIZED)
            return 0;
        g_ResizeWidth = (UINT)LOWORD(lParam);
        g_ResizeHeight = (UINT)HIWORD(lParam);
        return 0;
    case WM_SYSCOMMAND:
        if ((wParam & 0xfff0) == SC_KEYMENU)
            return 0;
        break;
    case WM_DESTROY:
        ::PostQuitMessage(0);
        return 0;
    }
    return ::DefWindowProcW(hWnd, msg, wParam, lParam);
}
