import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { quizId } = await req.json();

    if (!quizId) {
      return new Response(
        JSON.stringify({ error: 'Quiz ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabaseClient
      .from('quizzes')
      .select(`
        *,
        courses(*)
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: 'Quiz not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate SEB configuration
    const sebConfig = {
      originatorVersion: "3.7.1",
      useAsymmetricOnlyEncryption: false,
      allowWlan: false,
      allowAudioCapture: false,
      allowVideoCapture: false,
      allowApplicationLog: false,
      allowPreferencesWindow: false,
      allowSiri: false,
      allowDictation: false,
      allowSpellCheck: false,
      allowApplicationWindow: true,
      allowDeveloperConsole: false,
      allowDownUploads: false,
      allowFind: false,
      allowScreenSharing: false,
      allowTextEntry: true,
      allowUserAppFolderInstall: false,
      allowUserSwitching: false,
      enableAppSwitcherCheck: true,
      forceAppFolderInstall: true,
      enableMacOSAAC: true,
      enablePrintScreen: false,
      enableAltEsc: false,
      enableAltF4: false,
      enableAltTab: false,
      enableCtrlEsc: false,
      enableEsc: false,
      enableF1: false,
      enableF2: false,
      enableF3: false,
      enableF4: false,
      enableF5: false,
      enableF6: false,
      enableF7: false,
      enableF8: false,
      enableF9: false,
      enableF10: false,
      enableF11: false,
      enableF12: false,
      enableStartMenu: false,
      enableRightMouse: false,
      enablePrintScreen: false,
      enableWindowsUpdate: false,
      killExplorerShell: true,
      allowQuit: false,
      hashedQuitPassword: "",
      ignoreExitKeys: true,
      monitorProcesses: true,
      allowVirtualMachine: false,
      detectVirtualMachine: true,
      allowScreenProctoring: true,
      screenProctoringMetaDataURL: "",
      allowBrowsingBackForward: false,
      newBrowserWindowByLinkPolicy: 2,
      newBrowserWindowByScriptPolicy: 2,
      allowNewWindowCreation: false,
      showTaskBar: false,
      taskBarHeight: 40,
      touchOptimized: false,
      browserWindowAllowReload: false,
      browserWindowShowURL: false,
      browserWindowShowReloadWarning: true,
      removeBrowserProfile: true,
      disableLocalStorage: false,
      enableBrowserWindowToolbar: false,
      hideBrowserWindowToolbar: true,
      showMenuBar: false,
      showSideMenu: false,
      browserUserAgent: "",
      browserUserAgentMac: 0,
      browserUserAgentWinDesktopMode: 0,
      mainBrowserWindowWidth: "100%",
      mainBrowserWindowHeight: "100%",
      mainBrowserWindowPositioning: 1,
      enableZoomText: true,
      enableZoomPage: true,
      zoomMode: 0,
      allowSpellCheck: false,
      blockPopUpWindows: true,
      allowVideoCapture: false,
      allowAudioCapture: false,
      allowCamera: false,
      allowMicrophone: false,
      enablePlugIns: false,
      enableJava: false,
      enableJavaScript: true,
      blockJavaScript: false,
      allowFlashFullscreen: false,
      examSessionClearCookiesOnEnd: true,
      examSessionClearCookiesOnStart: true,
      cookiePolicy: 0,
      URLFilterEnable: true,
      URLFilterEnableContentFilter: false,
      blacklistURLFilter: "",
      whitelistURLFilter: "",
      startURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/quiz-access?quiz=${quizId}`,
      sendBrowserExamKey: true,
      examKeySalt: generateRandomSalt(),
      quitURL: "",
      restartExamURL: "",
      restartExamText: "Restart Exam",
      quitURLConfirm: true,
      restartExamPasswordProtected: false,
      hashedRestartExamPassword: "",
      allowReconfiguration: false,
      hashedAdminPassword: "",
      allowPreferencesWindow: false,
      permittedProcesses: [],
      prohibitedProcesses: [
        {
          active: true,
          currentUser: true,
          description: "Block messaging applications",
          executable: "skype",
          identifier: "",
          originalName: "",
          os: 0,
          strongKill: false,
          user: 0,
          windowHandling: 1
        },
        {
          active: true,
          currentUser: true,
          description: "Block web browsers",
          executable: "chrome",
          identifier: "",
          originalName: "",
          os: 0,
          strongKill: false,
          user: 0,
          windowHandling: 1
        },
        {
          active: true,
          currentUser: true,
          description: "Block web browsers",
          executable: "firefox",
          identifier: "",
          originalName: "",
          os: 0,
          strongKill: false,
          user: 0,
          windowHandling: 1
        }
      ]
    };

    // Save SEB configuration to database
    const { error: configError } = await supabaseClient
      .from('seb_configurations')
      .upsert({
        quiz_id: quizId,
        config_name: `${quiz.title} SEB Config`,
        config_data: sebConfig,
        created_by: quiz.courses.instructor_id
      });

    if (configError) {
      console.error('Error saving SEB config:', configError);
      return new Response(
        JSON.stringify({ error: 'Failed to save SEB configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert to SEB format (simplified JSON for now)
    const sebFileContent = JSON.stringify(sebConfig, null, 2);

    return new Response(sebFileContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_seb_config.seb"`
      },
    });

  } catch (error) {
    console.error('Error in generate-seb-config function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateRandomSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}