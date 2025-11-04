import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CourseModules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [modules, setModules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [topics, setTopics] = useState([{ title: "", description: "" }]);
  const [showTopics, setShowTopics] = useState({});

  useEffect(() => {
    fetchCourseName();
    fetchModules();
  }, [courseId]);

  const fetchCourseName = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      setCourseName(data?.title || "Course"); // Corrected: Access title instead of name
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course name");
    }
  };
  
  const handleDeleteModule = async (moduleId, moduleTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the module "${moduleTitle}"?`
    );
    if (!confirmDelete) return;

    try {
      // Delete related topics
      const { error: topicError } = await supabase
        .from("course_topics")
        .delete()
        .eq("module_id", moduleId);
      if (topicError) throw topicError;

      // Delete the module itself
      const { error: moduleError } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", moduleId);
      if (moduleError) throw moduleError;

      toast.success("Module deleted successfully");
      fetchModules();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete module");
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*, course_topics(*)")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load modules");
    }
  };

  const handleAddTopic = () =>
    setTopics([...topics, { title: "", description: "" }]);

  const handleTopicChange = (i, f, v) => {
    const updated = [...topics];
    updated[i][f] = v;
    setTopics(updated);
  };

  const handleSaveModule = async () => {
    if (!moduleTitle) return toast.error("Module title is required");
    try {
      const { data: moduleData, error: moduleError } = await supabase
        .from("course_modules")
        .insert([
          {
            course_id: courseId,
            title: moduleTitle,
            description: moduleDesc,
            order_index: modules.length + 1,
          },
        ])
        .select()
        .single();

      if (moduleError) throw moduleError;

      const topicsToInsert = topics
        .filter((t) => t.title.trim())
        .map((t, idx) => ({
          module_id: moduleData.id,
          title: t.title,
          description: t.description,
          order_index: idx + 1,
        }));

      if (topicsToInsert.length > 0) {
        const { error: topicError } = await supabase
          .from("course_topics")
          .insert(topicsToInsert);
        if (topicError) throw topicError;
      }

      toast.success("Module created successfully");
      setShowForm(false);
      setModuleTitle("");
      setModuleDesc("");
      setTopics([{ title: "", description: "" }]);
      fetchModules();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create module");
    }
  };

  const handleEditTopic = (moduleId, topicId) =>
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/manage_module`);

  const handleAddStudent = () => navigate(`/courses/${courseId}/add-student`);
  const handleViewStudent = async() => {
    navigate("/students", { state: { courseId } });
  };

  const toggleManageModule = (moduleId) =>
    setShowTopics((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  const Addtopic = (moduleId, moduleTitle) => {
    navigate(
      `/courses/${courseId}/modules/${moduleId}/add-topic`,
      { state: { moduleTitle } }
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Course Header */}
      <h1 className="text-4xl font-bold text-center text-indigo-700 tracking-tight drop-shadow-sm">
        {courseName}
      </h1>

      {/* Top Buttons */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Course Modules</h2>
        <div className="flex gap-3">
          <Button
            onClick={() => handleAddStudent()}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
          >
            + Add Student
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-md rounded-lg"
          >
            + Add Module
          </Button>
          <Button
                onClick={() => handleViewStudent()}
                className="bg-yellow-800 hover:bg-yellow-900 text-black transition-colors duration-200 shadow-md rounded-lg"
              >
                Students
              </Button>
        </div>
      </div>

      {/* Module Creation Form */}
      {showForm && (
        <Card className="shadow-xl border-indigo-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-700">
              Create Module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Module Title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="border-indigo-300 focus:ring-indigo-500"
            />
            <Textarea
              placeholder="Module Description"
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              className="border-indigo-300 focus:ring-indigo-500"
            />

            <h3 className="font-medium mt-4 text-gray-700">Topics</h3>
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="space-y-2 border border-gray-200 p-3 rounded-lg bg-gray-50"
              >
                <Input
                  placeholder="Topic Title"
                  value={topic.title}
                  onChange={(e) =>
                    handleTopicChange(idx, "title", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Topic Description"
                  value={topic.description}
                  onChange={(e) =>
                    handleTopicChange(idx, "description", e.target.value)
                  }
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddTopic}
              className="mt-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50"
            >
              + Add Another Topic
            </Button>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleSaveModule}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Save Module
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Modules */}
      <div className="grid gap-6">
        {modules.map((mod) => (
          <Card
            key={mod.id}
            className="shadow-md hover:shadow-xl transition-all border border-gray-200 rounded-2xl"
          >
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-700">
                {mod.title}
              </CardTitle>
              <p className="text-gray-600">{mod.description}</p>
            </CardHeader>

            {showTopics[mod.id] && (
              <CardContent className="bg-gray-50 rounded-xl">
                <div className="grid gap-4">
                  {mod.course_topics?.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{t.title}</p>
                        <p className="text-sm text-gray-500">{t.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditTopic(mod.id, t.id)}
                        className="border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                      >
                        Edit Topic
                      </Button>
                    </div>
                  ))}
                  {(!mod.course_topics || mod.course_topics.length === 0) && (
                    <p className="text-sm text-gray-500">No topics yet.</p>
                  )}
                </div>
              </CardContent>
            )}

            {/* Bottom Buttons */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
              <Button
               onClick={() => navigate(`/manage-module/${mod.id}`)}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition">
  Manage Module
</Button>

              <Button
                onClick={() => handleDeleteModule(mod.id, mod.title)}
                className="bg-yellow-800 hover:bg-yellow-900 text-black transition-colors duration-200 shadow-md rounded-lg"
              >
                Delete Module
              </Button>
              <Button
                onClick={() => Addtopic(mod.id, mod.title)}
                className="bg-yellow-800 hover:bg-yellow-900 text-black transition-colors duration-200 shadow-md rounded-lg"
              >
                Add Topic
              </Button>
              
            </div>
          </Card>
        ))}

        {modules.length === 0 && !showForm && (
          <p className="text-center text-gray-500 italic">
            No modules yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}