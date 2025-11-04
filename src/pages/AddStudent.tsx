import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

interface StudentForm {
  name: string;
  email: string;
  phone: string;
  mentor: string;
}

export default function AddStudent() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [student, setStudent] = useState<StudentForm>({
    name: "",
    email: "",
    phone: "",
    mentor: "",
  });
  const [dragActive, setDragActive] = useState(false);

  // ✅ Fetch all students for this course
  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) return;
      const { data, error } = await supabase
        .from("student")
        .select("*")
        .eq("course_id", courseId);

      if (error) {
        console.error(error);
        toast.error("Failed to fetch students");
      } else {
        setStudents(data || []);
      }
    };
    fetchStudents();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  // normalize keys
  const normalize = (s: any) =>
    String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const pick = (normalizedRow: Record<string, any>, candidates: string[]) => {
    for (const c of candidates) {
      if (
        Object.prototype.hasOwnProperty.call(normalizedRow, c) &&
        normalizedRow[c]
      ) {
        return normalizedRow[c];
      }
    }
    return null;
  };

  const handleFile = async (file: File) => {
    try {
      if (!file) return;
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
        toast.error("Please upload .xlsx, .xls or .csv file");
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const nameCandidates = ["name", "student", "studentname"];
      const emailCandidates = ["email", "emailaddress"];
      const phoneCandidates = ["phone", "phonenumber", "contact"];
      const mentorCandidates = ["mentor", "mentorname"];

      const cleanedRows = rows.map((row) => {
        const normalizedRow: Record<string, any> = {};
        Object.keys(row).forEach((k) => {
          normalizedRow[normalize(k)] = row[k];
        });

        return {
          name: pick(normalizedRow, nameCandidates.map(normalize)),
          email: pick(normalizedRow, emailCandidates.map(normalize)),
          phone: pick(normalizedRow, phoneCandidates.map(normalize)),
          mentor: pick(normalizedRow, mentorCandidates.map(normalize)),
        };
      });

      const inserts = cleanedRows.map((r) => ({
        student_id: uuidv4(),
        student_name: r.name,
        email: r.email,
        phone: r.phone,
        course_id: courseId ?? null,
        mentor_name: r.mentor,
      }));

      const { error } = await supabase.from("student").insert(inserts);
      if (error) throw error;

      toast.success("Excel data uploaded successfully!");
      setStudents((prev) => [...prev, ...inserts]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process Excel file");
    }
  };

  const handleSave = async () => {
    if (!student.name || !student.email || !student.phone || !student.mentor) {
      toast.error("All fields are required");
      return;
    }

    try {
      const studentId = uuidv4();
      const newStudent = {
        student_id: studentId,
        student_name: student.name,
        email: student.email,
        phone: student.phone,
        course_id: courseId,
        mentor_name: student.mentor,
      };

      const { error } = await supabase.from("student").insert([newStudent]);
      if (error) throw error;

      toast.success("Student added successfully!");
      setStudents((prev) => [...prev, newStudent]);
      setStudent({ name: "", email: "", phone: "", mentor: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add student");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Course Students
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div
            onDragEnter={(e) => setDragActive(true)}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer ${
              dragActive ? "border-blue-600 bg-blue-50" : "border-gray-400"
            }`}
          >
            <p className="font-medium">Upload Student Excel File</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              id="fileInput"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <Button
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                (document.getElementById("fileInput") as HTMLInputElement)?.click()
              }
            >
              Upload Excel
            </Button>
          </div>

          {/* Manual Entry */}
          <div className="grid grid-cols-1 gap-3">
            <Input name="name" placeholder="Student Name" value={student.name} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={student.email} onChange={handleChange} />
            <Input name="phone" placeholder="Phone" value={student.phone} onChange={handleChange} />
            <Input name="mentor" placeholder="Mentor" value={student.mentor} onChange={handleChange} />
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Student
            </Button>
          </div>

          {/* Student List */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Enrolled Students ({students.length})
            </h2>
            {students.length === 0 ? (
              <p className="text-gray-500">No students enrolled yet.</p>
            ) : (
              <table className="w-full border border-gray-300 text-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Phone</th>
                    <th className="border p-2">Mentor</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_id} className="text-center">
                      <td className="border p-2">{s.student_name}</td>
                      <td className="border p-2">{s.email}</td>
                      <td className="border p-2">{s.phone}</td>
                      <td className="border p-2">{s.mentor_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
