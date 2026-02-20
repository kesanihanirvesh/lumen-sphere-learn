import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Copy,
  ExternalLink,
  Trash2,
  Link2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Assignment {
  id: string;
  title: string;
  exam_url: string;
  created_at: string;
}

export default function CreateAssignment() {
  const { courseId } = useParams<{ courseId: string }>();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [examUrl, setExamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    if (!courseId) return;

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAssignments(data);
    }
  };

  const handleAdd = async () => {
    if (!courseId || !title.trim() || !examUrl.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("assignments").insert([
      {
        course_id: courseId,
        title: title.trim(),
        exam_url: examUrl.trim(),
      },
    ]);

    setLoading(false);

    if (!error) {
      setTitle("");
      setExamUrl("");
      setShowForm(false);
      fetchAssignments();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this quiz?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", id);

    if (!error) fetchAssignments();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const filteredAssignments = assignments.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827] text-white p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Course Quizzes</h1>
          <p className="text-gray-400 mt-1">
            Manage quizzes for this course
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-5 py-2.5 rounded-xl font-medium transition"
        >
          <Plus size={18} />
          Add Quiz
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#111827]/70 border border-gray-700 rounded-2xl p-4 flex gap-4 mb-10">
        <div className="flex items-center gap-3 bg-[#0b1220] rounded-xl px-4 py-3 w-full">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-sm placeholder-gray-500"
          />
        </div>

        <button className="flex items-center gap-2 bg-[#0b1220] px-4 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#111827]/80 border border-gray-700 rounded-2xl p-6 mb-10 shadow-lg max-w-xl">
          <h2 className="text-lg font-semibold mb-4">Create New Quiz</h2>

          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0b1220] border border-gray-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-blue-500 transition"
          />

          <div className="flex items-center bg-[#0b1220] border border-gray-700 rounded-xl px-4 py-3 mb-6 focus-within:border-blue-500 transition">
            <Link2 size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="https://quiz-link.com"
              value={examUrl}
              onChange={(e) => setExamUrl(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-xl font-medium transition"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setExamUrl("");
              }}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-xl transition"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quiz Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-gray-700 rounded-2xl bg-[#111827]/50">
          <p className="text-gray-400 text-lg">
            {searchTerm
              ? "No quizzes match your search"
              : "No quizzes added for this course"}
          </p>
          {!searchTerm && (
            <p className="text-gray-500 text-sm mt-2">
              Click "Add Quiz" to add one
            </p>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAssignments.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-[#111827]/80 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold mb-3">
                {quiz.title}
              </h2>

              <div className="bg-[#0b1220] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400 truncate mb-4">
                {quiz.exam_url}
              </div>

              <div className="text-sm text-gray-400 mb-4">
                Created {new Date(quiz.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(quiz.exam_url)}
                  className="flex items-center justify-center gap-2 w-full bg-black/50 hover:bg-black px-4 py-2 rounded-lg border border-gray-700 transition"
                >
                  <Copy size={16} />
                  Copy
                </button>

                <a
                  href={quiz.exam_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black/50 hover:bg-black p-2 rounded-lg border border-gray-700 transition"
                >
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="bg-red-600/80 hover:bg-red-600 p-2 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}