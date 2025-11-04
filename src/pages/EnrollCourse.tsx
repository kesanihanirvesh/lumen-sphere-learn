import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const EnrollCourse: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    courseName: "",
    coordinator: "",
    duration: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Student Enrolled:", formData);
    alert("Student enrolled successfully!");
    setFormData({ name: "", rollNumber: "", courseName: "", coordinator: "", duration: "" });
  };

  return (
    <Card className="m-6 shadow-lg">
      <CardHeader>
        <CardTitle>Enroll in Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Student Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label>Roll Number</Label>
            <Input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
          </div>
          <div>
            <Label>Course Name</Label>
            <Input name="courseName" value={formData.courseName} onChange={handleChange} required />
          </div>
          <div>
            <Label>Course Coordinator</Label>
            <Input name="coordinator" value={formData.coordinator} onChange={handleChange} required />
          </div>
          <div>
            <Label>Course Duration</Label>
            <Input name="duration" value={formData.duration} onChange={handleChange} required />
          </div>
          <Button type="submit">Enroll Student</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnrollCourse;
