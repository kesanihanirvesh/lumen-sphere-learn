import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function AddStudent() {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const navigate = useNavigate();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('students')
      .insert([{ student_name: studentName, student_email: studentEmail }]);
    if (!error) navigate('/students');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Student Name</Label>
              <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
            </div>
            <div>
              <Label>Student Email</Label>
              <Input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Add Student</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
