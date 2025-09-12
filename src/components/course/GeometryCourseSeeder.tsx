import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';

const geometryCourseStructure = {
  title: "Geometry – Semester 1 (ACP Blueprint Aligned)",
  description: "Build mastery in Geometry through adaptive learning paths, tailored to student learning styles. Aligned with ACP Blueprint covering 13 standards and 28 test items.",
  category: "Mathematics",
  difficulty_level: "intermediate",
  modules: [
    {
      title: "Coordinate and Transformation Geometry",
      description: "Master coordinate geometry concepts including distance, slope, midpoint formulas, and transformations.",
      order_index: 1,
      teks_standard: "G.2B, G.2C, G.3B",
      topics: [
        {
          title: "Distance Formula",
          description: "Learn to calculate distances between points using the distance formula.",
          order_index: 1,
          teks_standard: "G.2B",
          difficulty_level: "medium",
          estimated_duration: 45
        },
        {
          title: "Midpoint Formula", 
          description: "Find the midpoint between two points on a coordinate plane.",
          order_index: 2,
          teks_standard: "G.2B",
          difficulty_level: "medium",
          estimated_duration: 30
        },
        {
          title: "Slope of a Line",
          description: "Calculate and interpret the slope of lines to verify geometric relationships.",
          order_index: 3,
          teks_standard: "G.2B",
          difficulty_level: "medium",
          estimated_duration: 40
        },
        {
          title: "Parallel & Perpendicular Lines",
          description: "Determine equations of parallel and perpendicular lines through given points.",
          order_index: 4,
          teks_standard: "G.2C",
          difficulty_level: "hard",
          estimated_duration: 60
        },
        {
          title: "Transformations",
          description: "Understand rigid and non-rigid transformations including compositions and dilations.",
          order_index: 5,
          teks_standard: "G.3B",
          difficulty_level: "hard",
          estimated_duration: 75
        }
      ]
    },
    {
      title: "Logical Arguments and Constructions",
      description: "Develop logical reasoning skills and learn geometric constructions with compass and straightedge.",
      order_index: 2,
      teks_standard: "G.4B, G.4C, G.5A, G.5B, G.5C, G.5D",
      topics: [
        {
          title: "Conditional Statements",
          description: "Master if-then statements, converse, inverse, and contrapositive.",
          order_index: 1,
          teks_standard: "G.4B",
          difficulty_level: "medium",
          estimated_duration: 50
        },
        {
          title: "Counterexamples",
          description: "Learn to verify false conjectures using counterexamples.",
          order_index: 2,
          teks_standard: "G.4C",
          difficulty_level: "medium",
          estimated_duration: 35
        },
        {
          title: "Geometric Patterns and Conjectures",
          description: "Investigate patterns in angles, triangles, and polygons to make conjectures.",
          order_index: 3,
          teks_standard: "G.5A",
          difficulty_level: "medium",
          estimated_duration: 55
        },
        {
          title: "Geometric Constructions",
          description: "Construct congruent segments, angles, bisectors, and parallel lines using compass and straightedge.",
          order_index: 4,
          teks_standard: "G.5B",
          difficulty_level: "hard",
          estimated_duration: 90
        },
        {
          title: "Construction Conjectures",
          description: "Use constructions to make conjectures about geometric relationships.",
          order_index: 5,
          teks_standard: "G.5C",
          difficulty_level: "hard",
          estimated_duration: 60
        },
        {
          title: "Triangle Inequality Theorem",
          description: "Verify and apply the Triangle Inequality theorem using constructions.",
          order_index: 6,
          teks_standard: "G.5D",
          difficulty_level: "medium",
          estimated_duration: 45
        }
      ]
    },
    {
      title: "Proof and Congruence",
      description: "Master geometric proofs and congruence relationships in triangles and other figures.",
      order_index: 3,
      teks_standard: "G.6A, G.6C, G.6D",
      topics: [
        {
          title: "Angle Theorems",
          description: "Prove theorems about vertical angles and angles formed by parallel lines and transversals.",
          order_index: 1,
          teks_standard: "G.6A",
          difficulty_level: "hard",
          estimated_duration: 65
        },
        {
          title: "Congruence and Rigid Transformations",
          description: "Apply the definition of congruence in terms of rigid transformations.",
          order_index: 2,
          teks_standard: "G.6C",
          difficulty_level: "medium",
          estimated_duration: 50
        },
        {
          title: "Triangle Theorems",
          description: "Verify theorems including Pythagorean Theorem, angle sums, and properties of isosceles triangles.",
          order_index: 3,
          teks_standard: "G.6D",
          difficulty_level: "hard",
          estimated_duration: 80
        }
      ]
    },
    {
      title: "Two-Dimensional and Three-Dimensional Figures",
      description: "Apply formulas for areas of regular polygons and explore 3D figure relationships.",
      order_index: 4,
      teks_standard: "G.11A",
      topics: [
        {
          title: "Area of Regular Polygons",
          description: "Apply formulas to find areas of regular polygons using appropriate units of measure.",
          order_index: 1,
          teks_standard: "G.11A",
          difficulty_level: "medium",
          estimated_duration: 55
        }
      ]
    }
  ]
};

const createLearningMaterials = (topicId: string) => [
  // Visual materials
  {
    topic_id: topicId,
    title: "Interactive Diagram",
    description: "Visual representation with interactive elements",
    material_type: "interactive",
    learning_style: "visual",
    duration_minutes: 15,
    difficulty_level: "medium",
    is_required: true,
    order_index: 1,
    content_data: { type: "diagram", interactive: true }
  },
  {
    topic_id: topicId,
    title: "Concept Video",
    description: "Animated explanation of key concepts",
    material_type: "video",
    learning_style: "visual",
    duration_minutes: 20,
    difficulty_level: "medium",
    is_required: true,
    order_index: 2,
    content_data: { type: "video", animated: true }
  },
  // Auditory materials
  {
    topic_id: topicId,
    title: "Audio Explanation",
    description: "Narrated walkthrough of the concept",
    material_type: "audio",
    learning_style: "auditory",
    duration_minutes: 18,
    difficulty_level: "medium",
    is_required: true,
    order_index: 3,
    content_data: { type: "audio", narrated: true }
  },
  // Kinesthetic materials
  {
    topic_id: topicId,
    title: "Interactive Practice",
    description: "Hands-on practice with immediate feedback",
    material_type: "practice",
    learning_style: "kinesthetic",
    duration_minutes: 25,
    difficulty_level: "medium",
    is_required: true,
    order_index: 4,
    content_data: { type: "practice", interactive: true }
  },
  // Universal materials
  {
    topic_id: topicId,
    title: "Step-by-Step Examples",
    description: "Worked examples with detailed explanations",
    material_type: "document",
    learning_style: "universal",
    duration_minutes: 12,
    difficulty_level: "medium",
    is_required: false,
    order_index: 5,
    content_data: { type: "document", examples: true }
  }
];

export function GeometryCourseSeeder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createGeometryCourse = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create the main course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: geometryCourseStructure.title,
          description: geometryCourseStructure.description,
          category: geometryCourseStructure.category,
          difficulty_level: geometryCourseStructure.difficulty_level,
          instructor_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create modules and topics
      for (const moduleData of geometryCourseStructure.modules) {
        const { data: module, error: moduleError } = await supabase
          .from('course_modules')
          .insert({
            course_id: course.id,
            title: moduleData.title,
            description: moduleData.description,
            order_index: moduleData.order_index,
            teks_standard: moduleData.teks_standard
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Create topics for this module
        for (const topicData of moduleData.topics) {
          const { data: topic, error: topicError } = await supabase
            .from('course_topics')
            .insert({
              module_id: module.id,
              title: topicData.title,
              description: topicData.description,
              order_index: topicData.order_index,
              teks_standard: topicData.teks_standard,
              difficulty_level: topicData.difficulty_level,
              estimated_duration: topicData.estimated_duration
            })
            .select()
            .single();

          if (topicError) throw topicError;

          // Create learning materials for this topic
          const materials = createLearningMaterials(topic.id);
          const { error: materialsError } = await supabase
            .from('learning_materials')
            .insert(materials);

          if (materialsError) throw materialsError;

          // Create mastery requirements
          const requirements = [
            {
              topic_id: topic.id,
              requirement_type: 'pre_test_threshold',
              threshold_value: 30,
              is_required: false
            },
            {
              topic_id: topic.id,
              requirement_type: 'post_test_threshold',
              threshold_value: 70,
              is_required: true
            },
            {
              topic_id: topic.id,
              requirement_type: 'materials_completed',
              threshold_value: 80,
              is_required: true
            }
          ];

          const { error: requirementsError } = await supabase
            .from('mastery_requirements')
            .insert(requirements);

          if (requirementsError) throw requirementsError;
        }
      }

      toast({
        title: "Success!",
        description: "ACP Geometry course has been created with all modules, topics, and learning materials.",
      });

    } catch (error: any) {
      console.error('Error creating geometry course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create the geometry course.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          ACP Geometry Course Setup
        </CardTitle>
        <CardDescription>
          Create a complete Geometry course aligned with the ACP Blueprint including all 4 modules, 
          17 topics, and adaptive learning materials for each learning style.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2 text-sm">
            <div><strong>4 Main Modules:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Coordinate and Transformation Geometry (5 topics)</li>
              <li>Logical Arguments and Constructions (6 topics)</li>
              <li>Proof and Congruence (3 topics)</li>
              <li>Two-Dimensional and Three-Dimensional Figures (1 topic)</li>
            </ul>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div><strong>Learning Materials per Topic:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Visual: Interactive diagrams and concept videos</li>
              <li>Auditory: Narrated explanations and walkthroughs</li>
              <li>Kinesthetic: Interactive practice and simulations</li>
              <li>Universal: Step-by-step examples and documents</li>
            </ul>
          </div>

          <Button 
            onClick={createGeometryCourse} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Create ACP Geometry Course
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}