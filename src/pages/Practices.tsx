import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Practices() {
  const [formData, setFormData] = useState({
    topic_id: "",
    title: "",
    material_type: "document",
    learning_style: "universal",
    order_index: 1,
    description: "",
    content_url: "",
    content_data: "",
    duration_minutes: "",
    difficulty_level: "medium",
    is_required: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse JSON if provided
    let contentData = null;
    try {
      contentData = formData.content_data ? JSON.parse(formData.content_data) : null;
    } catch {
      alert("Invalid JSON in content_data field");
      return;
    }

    const { error } = await supabase.from("learning_materials").insert([
      {
        topic_id: formData.topic_id || null,
        title: formData.title,
        material_type: formData.material_type,
        learning_style: formData.learning_style,
        order_index: formData.order_index ? Number(formData.order_index) : null,
        description: formData.description || null,
        content_url: formData.content_url || null,
        content_data: contentData,
        duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
        difficulty_level: formData.difficulty_level || null,
        is_required: formData.is_required,
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Learning material inserted successfully!");
      setFormData({
        topic_id: "",
        title: "",
        material_type: "document",
        learning_style: "universal",
        order_index: 1,
        description: "",
        content_url: "",
        content_data: "",
        duration_minutes: "",
        difficulty_level: "medium",
        is_required: false,
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Learning Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="topic_id" placeholder="Topic ID (uuid)" value={formData.topic_id} onChange={handleChange} className="w-full border p-2 rounded" />
        <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" />

        <select name="material_type" value={formData.material_type} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="document">Document</option>
          <option value="video">Video</option>
          <option value="quiz">Quiz</option>
        </select>

        <select name="learning_style" value={formData.learning_style} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="universal">Universal</option>
          <option value="visual">Visual</option>
          <option value="auditory">Auditory</option>
          <option value="kinesthetic">Kinesthetic</option>
        </select>

        <input type="number" name="order_index" placeholder="Order Index" value={formData.order_index} onChange={handleChange} className="w-full border p-2 rounded" />

        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />

        <input type="text" name="content_url" placeholder="Content URL" value={formData.content_url} onChange={handleChange} className="w-full border p-2 rounded" />

        <textarea name="content_data" placeholder='Content Data (JSON e.g. {"type":"document"})' value={formData.content_data} onChange={handleChange} className="w-full border p-2 rounded" />

        <input type="number" name="duration_minutes" placeholder="Duration (minutes)" value={formData.duration_minutes} onChange={handleChange} className="w-full border p-2 rounded" />

        <select name="difficulty_level" value={formData.difficulty_level} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="is_required" checked={formData.is_required} onChange={handleChange} />
          <span>Is Required?</span>
        </label>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Material
        </button>
      </form>
    </div>
  );
}
