import React, { useEffect, useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardHeader,
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
  name: string;
  roll_number: string;
  course_name: string;
  instructor: string;
  duration: string;
  total_tests: number;
  due_tests: number;
}

const ManageMembers: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});

  // Fetch students from Supabase
  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("*");
    if (error) console.error(error);
    else setStudents(data || []);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Start editing
  const handleEdit = (student: Student) => {
    setEditId(student.id);
    setEditData(student);
  };

  // Handle field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Student
  ) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  // Save update
  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from("students")
      .update(editData)
      .eq("id", id);
    if (error) console.error(error);
    else {
      setEditId(null);
      fetchStudents();
    }
  };

  // Delete student
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) console.error(error);
    else fetchStudents();
  };

  return (
    <Card className="m-6 shadow-lg">
      <CardHeader>
        <CardTitle>Manage Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Total Tests</TableHead>
              <TableHead>Due Tests</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                {editId === student.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editData.name || ""}
                        onChange={(e) => handleChange(e, "name")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.roll_number || ""}
                        onChange={(e) => handleChange(e, "roll_number")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.course_name || ""}
                        onChange={(e) => handleChange(e, "course_name")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.instructor || ""}
                        onChange={(e) => handleChange(e, "instructor")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData.duration || ""}
                        onChange={(e) => handleChange(e, "duration")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editData.total_tests ?? 0}
                        onChange={(e) =>
                          handleChange(e, "total_tests")
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editData.due_tests ?? 0}
                        onChange={(e) =>
                          handleChange(e, "due_tests")
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSave(student.id)} size="sm">
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditId(null)}
                        className="ml-2"
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.course_name}</TableCell>
                    <TableCell>{student.instructor}</TableCell>
                    <TableCell>{student.duration}</TableCell>
                    <TableCell>{student.total_tests}</TableCell>
                    <TableCell>{student.due_tests}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        className="ml-2"
                      >
                        Delete
                      </Button>
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
