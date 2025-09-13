import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface Course {
  id: string;
  title: string;
}

export default function CreateGroup() {
  const [group, setGroup] = useState({
    name: "",
    description: "",
    courseId: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title");
      if (!error && data) setCourses(data);
    };
    fetchCourses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setGroup({ ...group, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { name, description, courseId } = group;
    const { error } = await supabase.from("student_groups").insert([
      {
        name,
        description,
        course_id: courseId,
        created_by: user?.id,
      },
    ]);
    setLoading(false);
    if (error) {
      alert("❌ Failed to create group: " + error.message);
    } else {
      alert("✅ Group created successfully!");
      setGroup({ name: "", description: "", courseId: "" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md border border-indigo-100 shadow-2xl rounded-2xl p-8">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-indigo-800 mb-8 text-center tracking-tight">
          🌟 Create a New Group
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              name="name"
              value={group.name}
              onChange={handleChange}
              required
              placeholder="Enter group name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={group.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Write a short description..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition resize-none"
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Course
            </label>
            <select
              name="courseId"
              value={group.courseId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            >
              <option value="">📘 Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

{/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {loading ? "⏳ Creating..." : "🚀 Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}