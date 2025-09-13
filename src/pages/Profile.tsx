import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, profile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    role: profile?.role || "",
    avatar_url: profile?.avatar_url || "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update profile in Supabase
  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          role: formData.role,
          avatar_url: formData.avatar_url,
          updated_at: new Date(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      alert("Profile updated successfully ✅");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err.message);
      alert("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-lg shadow-lg p-6">
        <CardHeader>
          <CardTitle className="text-xl">Profile Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <strong>Email:</strong> {user?.email || "No user data"}
            </p>

            {editMode ? (
              <>
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <Input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <Input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Avatar URL</label>
                  <Input
                    type="text"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Full Name:</strong> {profile?.full_name || "N/A"}
                </p>
                <p>
                  <strong>Role:</strong> {profile?.role || "N/A"}
                </p>
                <p>
                  <strong>Avatar:</strong>{" "}
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    "No Avatar"
                  )}
                </p>
                <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
