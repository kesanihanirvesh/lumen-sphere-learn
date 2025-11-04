import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { console } from "inspector";

export default function AddTopic() {
  const { moduleId } = useParams(); // from URL
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleTitle } = location.state || {};
  

  const [topic, setTopic] = useState({
    title: "",
    description: "",
    difficulty_level: "medium",
    estimated_duration: "",
    order_index: "",
  });
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTopic({ ...topic, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { title, description, difficulty_level, estimated_duration, order_index } = topic;

    const { error } = await supabase.from("course_topics").insert([
      {
        module_id: moduleId,
        title,
        description,
        difficulty_level,
        estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
        order_index: order_index ? parseInt(order_index) : null,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("❌ Failed to add topic: " + error.message);
    } else {
      alert("✅ Topic added successfully!");
      navigate(-1); // Go back to module view
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          Add Topic to {moduleTitle || "Module"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Topic Title"
            value={topic.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={topic.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <select
            name="difficulty_level"
            value={topic.difficulty_level}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="number"
            name="estimated_duration"
            placeholder="Estimated Duration (min)"
            value={topic.estimated_duration}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="order_index"
            placeholder="Order Index"
            value={topic.order_index}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Adding..." : "Add Topic"}
          </button>
        </form>
      </div>
    </div>
  );
}
