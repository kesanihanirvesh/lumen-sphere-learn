import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  Shield, 
  Zap, 
  Brain,
  GraduationCap,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';
import heroImage from '@/assets/hero-lms.jpg';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Courses",
      description: "Engaging multimedia content with 3D visualizations and interactive elements"
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "AI-powered anti-cheat system with real-time proctoring and behavior analysis"
    },
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to your pace and learning style"
    },
    {
      icon: Users,
      title: "Collaborative Environment",
      description: "Connect with peers and instructors in immersive virtual classrooms"
    },
    {
      icon: Award,
      title: "Certified Progress",
      description: "Earn verified certificates and track your learning achievements"
    },
    {
      icon: Zap,
      title: "Real-time Analytics",
      description: "Advanced analytics to monitor progress and optimize learning outcomes"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students" },
    { number: "1K+", label: "Expert Instructors" },
    { number: "500+", label: "Premium Courses" },
    { number: "99.9%", label: "Uptime Reliability" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden mesh-gradient">
        <ErrorBoundary fallback={<div />}>
          <FloatingShapes />
        </ErrorBoundary>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up-fade">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Future of
                  </span>
                  <br />
                  <span className="text-foreground">Learning</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Experience immersive education with 3D visualizations, AI-powered personalization, 
                  and advanced anti-cheat technology. Welcome to EduSphere.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="btn-hero group">
                      Go to Dashboard
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button size="lg" className="btn-hero group">
                        Start Learning
                        <Play className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="lg" variant="outline" className="btn-glass">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-float">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Future Learning Technology"
                  className="rounded-3xl shadow-2xl glow-effect"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">
              Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EduSphere</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionary learning platform combining cutting-edge technology with proven educational methodologies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-3d group animate-slide-up-fade" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center mb-4 group-hover:glow-effect transition-all">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students and instructors who are already experiencing the future of education
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user && (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="btn-hero group">
                      Get Started Free
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>Trusted by 50,000+ learners</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
