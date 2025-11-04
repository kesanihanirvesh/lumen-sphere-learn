import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TopicDetail() {
  const { topicId } = useParams();
  const {moduleId}=useParams();
  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("pre");
  const [preQuiz, setPreQuiz] = useState([]);
  const [postQuiz, setPostQuiz] = useState([]);
  const [urls, setUrls] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [addingUrl, setAddingUrl] = useState(false);
  const [form, setForm] = useState({ question: "", options: {}, correct_option: "" });
  const [urlForm, setUrlForm] = useState({ url: "", url_type: "" });

  // Fetch topic details
  useEffect(() => {
    const fetchTopic = async () => {
      const { data } = await supabase
        .from("course_topics")
        .select("*")
        .eq("id", topicId)
        .single();
      setTopic(data);
    };
    fetchTopic();
  }, [topicId]);

  // Load tab data dynamically
  useEffect(() => {
    if (activeTab === "pre") fetchPreQuiz();
    if (activeTab === "post") fetchPostQuiz();
    if (activeTab === "learning") fetchUrls();
  }, [activeTab]);

  // --- Fetchers ---
  const fetchPreQuiz = async () => {
    const { data } = await supabase.from("pre_assignment").select("*").eq("topic_id", topicId);
    setPreQuiz(data || []);
  };

  const fetchPostQuiz = async () => {
    const { data } = await supabase.from("post_assignment").select("*").eq("topic_id", topicId);
    setPostQuiz(data || []);
  };

  const fetchUrls = async () => {
    const { data } = await supabase.from("url").select("*").eq("topic_id", topicId);
    setUrls(data || []);
  };

  // --- Quiz Handlers ---
  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setForm({
      question: quiz?.question || "",
      options: quiz?.options || { a: "", b: "", c: "", d: "" },
      correct_option: quiz?.correct_option || "",
    });
  };

  const handleAdd = () => {
    setEditingQuiz({ id: null, isNew: true });
    setForm({ question: "", options: { a: "", b: "", c: "", d: "" }, correct_option: "" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    const table = activeTab === "pre" ? "pre_assignment" : "post_assignment";
    await supabase.from(table).delete().eq("id", id);
    activeTab === "pre" ? fetchPreQuiz() : fetchPostQuiz();
  };

  const handleSave = async () => {
    const table = activeTab === "pre" ? "pre_assignment" : "post_assignment";
    const payload = {
      topic_id: topicId,
      question: form.question,
      options: form.options,
      correct_option: form.correct_option,
    };

    if (editingQuiz?.id) {
      await supabase.from(table).update(payload).eq("id", editingQuiz.id);
    } else {
      await supabase.from(table).insert([payload]);
    }

    setEditingQuiz(null);
    activeTab === "pre" ? fetchPreQuiz() : fetchPostQuiz();
  };

  // --- Learning Material Handlers ---
  const handleAddUrl = async () => {
    if (!urlForm.url) return alert("Please enter a URL");

    const data=await supabase.from("url").insert([
      { module_id:moduleId,topic_id: topicId, url: urlForm.url, url_type: urlForm.url_type || "video" },
    ]);
    

    setAddingUrl(false);
    setUrlForm({ url: "", url_type: "" });
    fetchUrls();
  };

  // --- Renderers ---
  const renderQuiz = (quizData) => {
    if (!quizData || quizData.length === 0)
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-3">No questions available.</p>
          <Button onClick={handleAdd}>+ Add Question</Button>
        </div>
      );

    return (
      <>
        <Button onClick={handleAdd} className="mb-4 bg-green-600 text-white">
          + Add Question
        </Button>
        {quizData.map((q) => (
          <Card key={q.id} className="mb-4 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{q.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="mb-2">
                {Object.entries(q.options || {}).map(([key, value]) => (
                  <li key={key} className="ml-4">
                    <strong>{key.toUpperCase()}:</strong> {value}
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-green-700">
                ✅ Correct Option: {q.correct_option?.toUpperCase()}
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  onClick={() => handleEdit(q)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(q.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  };

  const renderLearningMaterial = () => {
    if (!urls || urls.length === 0)
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-3">No learning materials available.</p>
          <Button onClick={() => setAddingUrl(true)}>+ Add URL</Button>
        </div>
      );

    return (
      <>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Learning Materials</h3>
          <Button onClick={() => setAddingUrl(true)} className="bg-green-600 text-white">
            + Add URL
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urls.map((item) => (
            <Card key={item.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{item.url_type?.toUpperCase() || "Link"}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.url_type === "video" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${new URL(item.url).searchParams.get("v")}`}
                    title="Learning Video"
                    className="w-full h-56 rounded-lg"
                    allowFullScreen
                  />
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {item.url}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  const renderForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4">
          {editingQuiz?.id ? "Edit Question" : "Add Question"}
        </h3>
        <label className="block mb-2">Question:</label>
        <input
          type="text"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="border p-2 w-full mb-3 rounded"
        />

        {["a", "b", "c", "d"].map((key) => (
          <div key={key} className="mb-2">
            <label>{key.toUpperCase()}:</label>
            <input
              type="text"
              value={form.options[key]}
              onChange={(e) =>
                setForm({
                  ...form,
                  options: { ...form.options, [key]: e.target.value },
                })
              }
              className="border p-2 w-full rounded"
            />
          </div>
        ))}

        <label className="block mb-2 mt-3">Correct Option:</label>
        <input
          type="text"
          value={form.correct_option}
          onChange={(e) => setForm({ ...form, correct_option: e.target.value })}
          className="border p-2 w-full mb-4 rounded"
          placeholder="a / b / c / d"
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditingQuiz(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );

  const renderAddUrlForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4">Add Learning Material</h3>
        <label className="block mb-2">URL:</label>
        <input
          type="text"
          value={urlForm.url}
          onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
          className="border p-2 w-full mb-3 rounded"
          placeholder="Enter video or resource link"
        />
        <label className="block mb-2">Type:</label>
        <input
          type="text"
          value={urlForm.url_type}
          onChange={(e) => setUrlForm({ ...urlForm, url_type: e.target.value })}
          className="border p-2 w-full mb-4 rounded"
          placeholder="e.g., video / document / link"
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setAddingUrl(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUrl}>Add</Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "pre":
        return (
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Pre-Assignment Quiz</h3>
            {renderQuiz(preQuiz)}
          </div>
        );
      case "post":
        return (
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Post-Assignment Quiz</h3>
            {renderQuiz(postQuiz)}
          </div>
        );
      case "learning":
        return <div className="p-4">{renderLearningMaterial()}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {topic ? topic.title : "Loading Topic..."}
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={() => setActiveTab("pre")} variant={activeTab === "pre" ? "default" : "outline"}>
          Pre-Assignment
        </Button>
        <Button onClick={() => setActiveTab("post")} variant={activeTab === "post" ? "default" : "outline"}>
          Post-Assignment
        </Button>
        <Button onClick={() => setActiveTab("learning")} variant={activeTab === "learning" ? "default" : "outline"}>
          Learning Material
        </Button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md">{renderContent()}</div>

      {editingQuiz && renderForm()}
      {addingUrl && renderAddUrlForm()}
    </div>
  );
}
