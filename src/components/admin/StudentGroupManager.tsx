import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
}

interface Student {
  id: string;
  full_name: string;
  user_id: string;
}

interface GroupMember {
  id: string;
  student_id: string;
  profiles: {
    full_name: string;
  } | null;
}

export function StudentGroupManager() {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('student_groups')
        .select(`
          *,
          group_memberships(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithCounts = data?.map(group => ({
        ...group,
        member_count: group.group_memberships?.[0]?.count || 0
      })) || [];

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load student groups');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, user_id')
        .eq('role', 'student');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const { data: memberships, error } = await supabase
        .from('group_memberships')
        .select('id, student_id')
        .eq('group_id', groupId);

      if (error) throw error;

      const membersWithProfiles = await Promise.all(
        (memberships || []).map(async (membership) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', membership.student_id)
            .single();

          return {
            ...membership,
            profiles: { full_name: profile?.full_name || 'Unknown User' }
          };
        })
      );

      setGroupMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('student_groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim(),
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('Student group created successfully');
      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreateDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create student group');
    } finally {
      setLoading(false);
    }
  };

  const addStudentToGroup = async () => {
    if (!selectedGroup || !selectedStudentId) {
      toast.error('Please select both a group and a student');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_memberships')
        .insert({
          group_id: selectedGroup,
          student_id: selectedStudentId,
          added_by: user.id,
        });

      if (error) throw error;

      toast.success('Student added to group');
      setSelectedStudentId('');
      fetchGroups();
      fetchGroupMembers(selectedGroup);
    } catch (error) {
      console.error('Error adding student to group:', error);
      toast.error('Failed to add student to group');
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromGroup = async (membershipId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('group_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      toast.success('Student removed from group');
      fetchGroups();
      fetchGroupMembers(selectedGroup);
    } catch (error) {
      console.error('Error removing student from group:', error);
      toast.error('Failed to remove student from group');
    } finally {
      setLoading(false);
    }
  };

  const availableStudents = students.filter(
    student => !groupMembers.find(member => member.student_id === student.user_id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Group Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Student Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Enter group description (optional)"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createGroup} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedGroup === group.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{group.name}</h3>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {group.member_count}
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {group.description}
                    </p>
                  )}
                </div>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No student groups created yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group Members Management */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedGroup ? 'Group Members' : 'Select a Group'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroup ? (
              <div className="space-y-4">
                {/* Add Student */}
                <div className="flex gap-2">
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select student to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.user_id}>
                          {student.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={addStudentToGroup}
                    disabled={!selectedStudentId || loading}
                  >
                    Add
                  </Button>
                </div>

                {/* Current Members */}
                <div className="space-y-2">
                  <h4 className="font-medium">Current Members</h4>
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{member.profiles?.full_name || 'Unknown User'}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeStudentFromGroup(member.id)}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {groupMembers.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No members in this group yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a group from the left to manage its members.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}