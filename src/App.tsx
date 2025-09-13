import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LearningPath from "./pages/LearningPath";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import QuizTaking from "./pages/QuizTaking";
import NotFound from "./pages/NotFound";
import Myquizpage from "./pages/Myquizpage";
import Myquiz from "./pages/Myquiz";
import Profile from "./pages/Profile";
import CreateGroup from "./pages/CreateGroup";
import CreateCourse from "./pages/CreateCourse";

import { MantineProvider } from "@mantine/core";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* ✅ MantineProvider wraps the whole app */}
        <MantineProvider
          theme={{
            primaryColor: "blue",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <BrowserRouter>
            <div className="min-h-screen">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/course/:courseId" element={<CourseDetail />} />
                  <Route path="/learn/:topicId" element={<LearningPath />} />
                  <Route path="/instructor" element={<InstructorDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/quiz/:quizType/:topicId" element={<QuizTaking />} />

                  {/* Redirect analytics to courses */}
                  <Route path="/analytics" element={<Navigate to="/courses" replace />} />

                  {/* Profile + Quiz Pages */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/quizunique" element={<Myquizpage />} />
                  <Route path="/myquiz" element={<Myquiz />} />

                  {/* Course & Group creation */}
                  <Route path="/CreateCourse" element={<CreateCourse />} />
                  <Route path="/CreateGroup" element={<CreateGroup />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </MantineProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
