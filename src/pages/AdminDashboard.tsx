import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BookOpen, UserPlus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate , useNavigate} from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import FetchStatsCard from '@/components/dashboard/FetchStatsCard';
interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  created_at: string;
  is_active: boolean;
  difficulty_level: string;
  category: string;
  enrollment_count?: number;
}

interface Student {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  user_id: string;
}

interface StudentGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalGroups: 0
  });

  // Redirect if not admin
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, profile]);
  

  const handleManageCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/modules`);
  };
  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast.success('Course deleted successfully');
      fetchAdminData(); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  // ... rest of the component


  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all courses with enrollment counts
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count)
        `);

      if (coursesError) throw coursesError;

      // Fetch all users with profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;

      // Fetch student groups with member counts
      const { data: groupsData, error: groupsError } = await supabase
        .from('student_groups')
        .select(`
          *,
          group_memberships(count)
        `);

      if (groupsError) throw groupsError;

      const coursesWithCounts = coursesData?.map(course => ({
        ...course,
        enrollment_count: course.enrollments?.[0]?.count || 0
      })) || [];

      const studentsData = usersData?.filter(u => u.role === 'student') || [];
      const instructorsData = usersData?.filter(u => u.role === 'instructor') || [];

      const groupsWithCounts = groupsData?.map(group => ({
        ...group,
        member_count: group.group_memberships?.[0]?.count || 0
      })) || [];

      setCourses(coursesWithCounts);
      setStudents(studentsData);
      setInstructors(instructorsData);
      setGroups(groupsWithCounts);

      setStats({
        totalCourses: coursesWithCounts.length,
        totalStudents: studentsData.length,
        totalInstructors: instructorsData.length,
        totalGroups: groupsWithCounts.length
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  const handleCreateGroup = () => {
    navigate('/create-group');
  };
  const handleAddInstructor = () => {
    navigate('instructor-signup');
  };

  const handleEnrollStudent = () => {
    toast.info('Student enrollment feature coming soon');
  };

  const handleDownloadSEBConfig = (courseId: string) => {
    toast.info('SEB configuration download coming soon');
  };
  const handleNavigate = (path: string) => navigate(path);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage courses, students, and assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
          <Button onClick={handleCreateGroup} variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
          <Button onClick={handleAddInstructor} variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div  className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => handleNavigate('/admin/courses')}className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active learning paths
            </p>
          </CardContent>
        </Card>
        
        <Card onClick={() => handleNavigate('/admin/student')}className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Registered learners
            </p>
          </CardContent>
        </Card>

        <Card onClick={() => handleNavigate('/admin/instructor-list')}className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
            <p className="text-xs text-muted-foreground">
              Active educators
            </p>
          </CardContent>
        </Card>

        <Card onClick={() => handleNavigate('/admin/group')}className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Groups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Organized cohorts
            </p>
          </CardContent>
        </Card>
      </div>

      
      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="groups">Student Groups</TabsTrigger>
          <TabsTrigger value="Instructor">Instructor</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
  <div className="grid gap-4">
    {courses.map((course) => (
      <div
        key={course.id}
        className="flex items-center justify-between p-4 border rounded-lg"
      >
        <div className="space-y-1">
          <h3 className="font-medium">{course.title}</h3>
          <p className="text-sm text-muted-foreground">
            {course.description}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={course.is_active ? "default" : "secondary"}>
              {course.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {course.enrollment_count} students
            </Badge>
            <Badge variant="outline">{course.difficulty_level}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleManageCourse(course.id)}
            variant="outline"
            size="sm"
          >
            Manage Course
          </Button>
          <Button
            onClick={() => deleteCourse(course.id)}
            variant="outline"
            size="sm"
          >
            Delete Course
          </Button>
        </div>
      </div>
    ))}
    {courses.length === 0 && (
      <div className="text-center py-8 text-muted-foreground">
        No courses found. Create your first course to get started.
      </div>
    )}
  </div>
</CardContent>

          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">{student.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(student.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Progress
                      </Button>
                      <Button variant="outline" size="sm">
                        Add to Group
                      </Button>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.description}
                      </p>
                      <Badge variant="outline">
                        {group.member_count} members
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('/manage-members')}>
                        Manage Members
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate('/enroll-course')}>
                        Enroll in Course
                      </Button>
                    </div>
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No student groups found. Create a group to organize your students.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Instructor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
              <button variant="outline" size="sm" onClick={() => navigate('/instructor')}>

                Go to Instructor Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}