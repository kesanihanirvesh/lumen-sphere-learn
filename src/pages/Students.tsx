import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Students() {
  const { state } = useLocation();
  const courseId = state?.courseId;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    student_name: "",
    email: "",
    phone: "",
    mentor_name: "",
  });

  // Fetch students from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      console.log("🔍 Fetching students for course ID:", courseId);

      if (!courseId) {
        setErrorMsg("No course ID provided.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("student")
        .select("*")
        .eq("course_id", String(courseId).trim());

      if (error) {
        console.error("❌ Error fetching students:", error.message);
        setErrorMsg("Failed to fetch student data.");
      } else {
        console.log("✅ Fetched students:", data);
        setStudents(data || []);
      }

      setLoading(false);
    };

    fetchStudents();
  }, [courseId]);

  // Handle edit button click
  const handleEdit = (student) => {
    setEditingId(student.id);
    setEditForm({
      student_name: student.student_name,
      email: student.email,
      phone: student.phone,
      mentor_name: student.mentor_name,
    });
  };

  // Handle update button click
  const handleUpdate = async (id) => {
    console.log("📝 Updating student:", id, editForm);
    const { error } = await supabase
      .from("student")
      .update(editForm)
      .eq("id", id);

    if (error) {
      console.error("❌ Error updating student:", error.message);
      alert("Failed to update student details.");
    } else {
      alert("✅ Student updated successfully!");
      setEditingId(null);

      // Refresh data
      const { data } = await supabase
        .from("student")
        .select("*")
        .eq("course_id", String(courseId).trim());
      setStudents(data || []);
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading students...</div>;
  if (errorMsg) return <div className="p-6 text-red-600 text-lg">{errorMsg}</div>;

  return (
    <div className="p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-700">
            Students (Course ID: {courseId})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {students.length === 0 ? (
            <div>No students found for this course.</div>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Phone</th>
                  <th className="py-2 px-4 border">Mentor</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="text-center hover:bg-gray-50">
                    <td className="py-2 px-4 border">{s.id}</td>

                    {editingId === s.id ? (
                      <>
                        <td className="py-2 px-4 border">
                          <input
                            value={editForm.student_name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                student_name: e.target.value,
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        </td>
                        <td className="py-2 px-4 border">
                          <input
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        </td>
                        <td className="py-2 px-4 border">
                          <input
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        </td>
                        <td className="py-2 px-4 border">
                          <input
                            value={editForm.mentor_name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                mentor_name: e.target.value,
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        </td>
                        <td className="py-2 px-4 border">
                          <Button
                            onClick={() => handleUpdate(s.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Save
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 border">{s.student_name}</td>
                        <td className="py-2 px-4 border">{s.email}</td>
                        <td className="py-2 px-4 border">{s.phone}</td>
                        <td className="py-2 px-4 border">{s.mentor_name}</td>
                        <td className="py-2 px-4 border">
                          <Button
                            onClick={() => handleEdit(s)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Edit
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
