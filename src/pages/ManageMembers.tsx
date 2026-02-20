import React, { useEffect, useState } from "react";
import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Student {
  id: string;
  student_name: string | null;
  student_id: string | null;
  email: string | null;
  phone: string | null;
  mentor_name: string | null;
  course_id: string | null;
}

const ManageMembers: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch students from Supabase
  const fetchStudents = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.from("student").select("*");
    if (error) console.error(error);
    else setStudents((data || []) as Student[]);
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData(student);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Student) => {
    setEditData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (id: string) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from("student")
      .update(editData)
      .eq("id", id);
    if (error) console.error(error);
    else {
      setEditingId(null);
      fetchStudents();
    }
  };

  // Delete student
  const handleDelete = async (id: string) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("student").delete().eq("id", id);
    if (error) console.error(error);
    else fetchStudents();
  };

  return (
    <Card className="m-6">
      <CardContent>
        <CardTitle className="mb-4 pt-4">Manage Members</CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                {editingId === student.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editData.student_name || ""}
                        onChange={(e) => handleChange(e, "student_name")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.student_id || ""}
                        onChange={(e) => handleChange(e, "student_id")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.email || ""}
                        onChange={(e) => handleChange(e, "email")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.phone || ""}
                        onChange={(e) => handleChange(e, "phone")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.mentor_name || ""}
                        onChange={(e) => handleChange(e, "mentor_name")}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleSave(student.id)}>Save</Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{student.student_name}</TableCell>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.mentor_name}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(student.id)}>Delete</Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ManageMembers;
