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
import CreateCourse from "./pages/CreateCourse";
import CreateGroup from "./pages/CreateGroup";
import EnrollCourse from "./pages/EnrollCourse";
import ManageMembers from "./pages/ManageMembers";
import CourseModules from "./pages/CourseModules";
import TopicDetail from "./pages/TopicDetail";
import PreQuiz from "./pages/PreQuiz";
import PostQuiz from "./pages/PostQuiz";
import Practices from "./pages/Practices";
import AddStudent from "./pages/AddStudent";
import AddStudents from "./pages/AddStudent";
import InstructorSignup from "./pages/InstructorSignup";
import StudentSignup from "./pages/StudentSignup";
import ListView from "./components/dashboard/ListView";
import AddTopic from "./pages/AddTopic";
import Manage_module from "./pages/Manage_module";
//import ExamPage from "./ExamPage";
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
            {/* <ExamPage/> */}
            <main className="pt-16">
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-course" element={<CreateCourse />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/learn/:topicId" element={<LearningPath />} />
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/enroll-course" element={<EnrollCourse />} />
              <Route path="/manage-members" element={<ManageMembers />} />
              <Route path="/quiz/:quizType/:topicId" element={<QuizTaking />} />
              <Route path="/courses/:courseId/modules" element={<CourseModules />} />
              {/* Redirect analytics to courses */}
              <Route path="/analytics" element={<Navigate to="/courses" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/topic/:topicId" element={<TopicDetail />} />
              <Route path="/manage-module/:moduleId" element={<Manage_module />} />

              <Route path="/quizunique" element={<Myquizpage/>} />
              <Route path="/courses/:courseId/add-student" element={<AddStudent />} />
              
              <Route path="/myquiz" element={<Myquiz/>} />
              <Route path="/courses/:courseId/modules/:moduleId/add-topic"element={<AddTopic />}/>
              <Route path="/admin/instructor-signup" element={<InstructorSignup />} />
              <Route path="/student-signup" element={<StudentSignup />} />
              <Route path="/courses/:courseId/modules/:moduleId/topics/:topicId/pre-quiz"element={<PreQuiz />}/>
              <Route path="/courses/:courseId/modules/:moduleId/topics/:topicId/post-quiz"element={<PostQuiz />}/>
              <Route path="/courses/:courseId/modules/:moduleId/topics/:topicId/practices"element={<Practices />}/>

              <Route path="/admin/student" element={<ListView table="student" columns={['student_name', 'email']} />} />
              <Route path="/admin/instructor-list" element={<ListView table="instructors" columns={['full_name', 'email','course']} />} />
              <Route path="/admin/courses" element={<ListView table="courses" columns={['title','description']} />} />
              <Route path="/admin/group" element={<ListView table="student_groups" columns={['name', 'description']} />} />

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
