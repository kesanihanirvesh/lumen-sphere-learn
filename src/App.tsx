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
import InstructorSignup from "./pages/InstructorSignup";
import StudentSignup from "./pages/StudentSignup";
import ListView from "./components/dashboard/ListView";
import AddTopic from "./pages/AddTopic";
import Manage_module from "./pages/Manage_module";
import CreateAssignment from "./pages/CreateAssignment";


import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

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

                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/student-signup" element={<StudentSignup />} />
                <Route path="/admin/instructor-signup" element={<InstructorSignup />} />
                <Route path="/admin-dashboard/instructor-signup" element={<InstructorSignup />} />

                {/* DASHBOARD - All logged-in roles */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student","admin"]}>
                        <Dashboard />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                {/* ADMIN ONLY */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />
                <Route
                     path="/courses/:courseId/create-assignment"
                           element={<CreateAssignment />}/>

                <Route
                  path="/admin/student"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ListView table="student" columns={["student_name", "email"]} />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/instructor-list"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ListView table="instructors" columns={["full_name", "email", "course"]} />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/courses"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ListView table="courses" columns={["title", "description"]} />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/group"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["admin"]}>
                        <ListView table="student_groups" columns={["name", "description"]} />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                {/* INSTRUCTOR ONLY */}
                <Route
                  path="/instructor-dashboard"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor"]}>
                        <InstructorDashboard />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                {/* STUDENT + INSTRUCTOR + ADMIN */}
                <Route
                  path="/create-course"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor", "admin"]}>
                        <CreateCourse />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/create-group"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor", "admin"]}>
                        <CreateGroup />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
                        <Courses />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/course/:courseId"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
                        <CourseDetail />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/learn/:topicId"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
                        <LearningPath />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route path="/analytics" element={<Navigate to="/courses" replace />} />

                <Route
                  path="/topic/:topicId"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
                        <TopicDetail />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/manage-module/:moduleId"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor", "admin"]}>
                        <Manage_module />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/quizunique"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
                        <Myquizpage />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses/:courseId/add-student"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor", "admin"]}>
                        <AddStudent />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/modules"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor", "admin"]}>
                        <CourseModules />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/myquiz"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student"]}>
                        <Myquiz />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses/:courseId/modules/:moduleId/add-topic"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["instructor", "admin"]}>
                        <AddTopic />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                {/* STUDENT ONLY */}
                <Route
                  path="/courses/:courseId/modules/:moduleId/topics/:topicId/pre-quiz"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student"]}>
                        <PreQuiz />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses/:courseId/modules/:moduleId/topics/:topicId/post-quiz"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student"]}>
                        <PostQuiz />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses/:courseId/modules/:moduleId/topics/:topicId/practices"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student"]}>
                        <Practices />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                {/* QUIZ TAKING */}
                <Route
                  path="/quiz/:quizType/:topicId"
                  element={
                    <PrivateRoute>
                      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
                        <QuizTaking />
                      </RoleRoute>
                    </PrivateRoute>
                  }
                />

                {/* 404 */}
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
