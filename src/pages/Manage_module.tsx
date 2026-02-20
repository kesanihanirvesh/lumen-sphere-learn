import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ManageModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    console.log("Module ID from URL:", moduleId);
    const fetchModuleData = async () => {
      const { data: modData } = await supabase
        .from("course_modules")
        .select("id, title")
        .eq("id", moduleId)
        .single();
      setModule(modData);

      const { data: topicData } = await supabase
        .from("course_topics")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: true });
      setTopics(topicData);
    };
    fetchModuleData();
  }, [moduleId]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        {module ? module.title : "Loading Module..."}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Card
            key={topic.id}  
            className="shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => {
  console.log("Clicked Topic ID:", topic.id);
  navigate(`/topic/${topic.id}`);
}}

          >
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
