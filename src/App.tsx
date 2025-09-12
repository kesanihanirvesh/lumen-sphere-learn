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
import QuizTaking from "./pages/QuizTaking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              <Route path="/quiz/:quizType/:topicId" element={<QuizTaking />} />
              {/* Redirect analytics to courses */}
              <Route path="/analytics" element={<Navigate to="/courses" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
