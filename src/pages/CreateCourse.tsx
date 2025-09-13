import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export default function CreateCourse() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    difficulty_level: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { title, description, category, difficulty_level, is_active } = course;
    const { error } = await supabase
      .from("courses")
      .insert([{
        title,
        description,
        category,
        difficulty_level,
        is_active,
        instructor_id: user?.id
      }]);
    setLoading(false);
    if (error) {
      alert("Failed to create course: " + error.message);
    } else {
      alert("Course created successfully!");
      setCourse({
        title: "",
        description: "",
        category: "",
        price: "",
        difficulty_level: "",
        is_active: true,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 p-6">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
          🚀 Create a New Course
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              value={course.title}
              onChange={handleChange}
              required
              placeholder="Enter course title"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={course.description}
              onChange={handleChange}
              required
              placeholder="Briefly describe your course..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition resize-none"
              rows={4}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={course.category}
              onChange={handleChange}
              placeholder="e.g. Web Development"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              name="difficulty_level"
              value={course.difficulty_level}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            >
              <option value="">Select level</option>
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">⚡ Intermediate</option>
              <option value="advanced">🔥 Advanced</option>
            </select>
          </div>

          {/* Active status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              name="is_active"
              value={course.is_active ? "true" : "false"}
              onChange={e =>
                setCourse({ ...course, is_active: e.target.value === "true" })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            >
              <option value="true">✅ Active</option>
              <option value="false">🚫 Inactive</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
