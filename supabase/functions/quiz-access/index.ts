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
    const url = new URL(req.url);
    const quizId = url.searchParams.get('quiz');
    const browserExamKey = req.headers.get('x-safeexambrowser-requesthash');

    if (!quizId) {
      return new Response(
        'Missing quiz parameter',
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabaseClient
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return new Response(
        'Quiz not found',
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      );
    }

    // Verify SEB access if required
    if (quiz.seb_required && !browserExamKey) {
      return new Response(
        generateAccessDeniedPage(),
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html',
            'X-SafeExamBrowser-RequireHash': 'true'
          } 
        }
      );
    }

    // Generate the quiz access page
    const quizPage = generateQuizAccessPage(quizId, quiz.title);

    return new Response(quizPage, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error in quiz-access function:', error);
    return new Response(
      'Internal server error',
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
    );
  }
});

function generateAccessDeniedPage(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied - Safe Exam Browser Required</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                color: #dc3545;
                margin-bottom: 1rem;
            }
            p {
                color: #6c757d;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            .instructions {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 5px;
                border-left: 4px solid #007bff;
                text-align: left;
            }
            .instructions ol {
                margin: 0;
                padding-left: 1.2rem;
            }
            .instructions li {
                margin-bottom: 0.5rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🔒</div>
            <h1>Access Denied</h1>
            <p>This exam requires Safe Exam Browser (SEB) for secure assessment.</p>
            
            <div class="instructions">
                <h3>To access this exam:</h3>
                <ol>
                    <li>Download the SEB configuration file from your course page</li>
                    <li>Open the configuration file to launch Safe Exam Browser</li>
                    <li>The exam will load automatically in the secure browser</li>
                </ol>
            </div>
            
            <p><strong>Note:</strong> Regular web browsers are not permitted for this assessment to ensure exam integrity.</p>
        </div>
    </body>
    </html>
  `;
}

function generateQuizAccessPage(quizId: string, quizTitle: string): string {
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || '';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Quiz Access - ${quizTitle}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 600px;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                color: #28a745;
                margin-bottom: 1rem;
            }
            p {
                color: #6c757d;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            .quiz-info {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 5px;
                margin-bottom: 2rem;
                text-align: left;
            }
            .access-button {
                background: #007bff;
                color: white;
                padding: 1rem 2rem;
                border: none;
                border-radius: 5px;
                font-size: 1.1rem;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: background 0.3s;
            }
            .access-button:hover {
                background: #0056b3;
            }
            .security-notice {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 1rem;
                border-radius: 5px;
                margin-top: 2rem;
                font-size: 0.9rem;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">✅</div>
            <h1>Secure Browser Verified</h1>
            <p>You are accessing this exam through Safe Exam Browser. The secure environment has been established.</p>
            
            <div class="quiz-info">
                <h3>Quiz: ${quizTitle}</h3>
                <p>You may now proceed to the quiz. Remember to:</p>
                <ul>
                    <li>Complete the quiz in one session</li>
                    <li>Do not attempt to exit the browser during the exam</li>
                    <li>Ensure you have a stable internet connection</li>
                </ul>
            </div>
            
            <a href="${baseUrl}/quiz/${quizId}" class="access-button">
                Start Quiz
            </a>
            
            <div class="security-notice">
                <strong>Security Notice:</strong> This session is monitored for academic integrity. 
                Any attempt to access unauthorized resources will be logged.
            </div>
        </div>
        
        <script>
            // Prevent right-click context menu
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
            
            // Prevent certain keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Block F12, Ctrl+Shift+I, Ctrl+U, etc.
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                    (e.ctrlKey && e.key === 'u')) {
                    e.preventDefault();
                }
            });
            
            // Log access attempt
            console.log('Quiz access logged at:', new Date().toISOString());
        </script>
    </body>
    </html>
  `;
}