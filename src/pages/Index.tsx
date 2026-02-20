import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap, BookOpen, Users, Award, ArrowRight,
  CheckCircle, Star, ChevronRight, Shield, BarChart3, Bell
} from 'lucide-react';

const StatCard: React.FC<{ number: string; label: string; icon: React.ReactNode }> = ({ number, label, icon }) => (
  <div className="text-center p-6">
    <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-3 shadow-md">
      {icon}
    </div>
    <div className="text-3xl font-bold text-foreground mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
  <Card className="border border-border/50 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 group">
    <CardContent className="p-6">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </CardContent>
  </Card>
);

const Index: React.FC = () => {
  const { user, role } = useAuth();

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'teacher') return '/teacher';
    return '/student';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero absolute inset-0 opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Star className="w-3.5 h-3.5 fill-current" />
                Modern Student Management
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Smart Student
                <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-hero)' }}>
                  Management System
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                A comprehensive platform for educational institutes to manage students, teachers, and courses — all in one place with role-based access control.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to={getDashboardPath()}>
                    <Button size="lg" className="gradient-hero border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2">
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button size="lg" className="gradient-hero border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2">
                        Get Started Free <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="lg" variant="outline" className="gap-2">
                        Login <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {['Role-based Access', 'Real-time Updates', 'Secure & Fast'].map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 gradient-hero rounded-3xl opacity-10 blur-3xl" />
                <div className="relative z-10 space-y-4 p-6">
                  {/* Mock dashboard cards */}
                  <Card className="shadow-card border border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">1,200 Students</p>
                        <p className="text-xs text-muted-foreground">Enrolled this semester</p>
                      </div>
                      <div className="ml-auto text-green-500 text-xs font-medium">+12%</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border border-border/50 ml-8">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">48 Courses</p>
                        <p className="text-xs text-muted-foreground">Active this term</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">98% Satisfaction</p>
                        <p className="text-xs text-muted-foreground">Faculty rating</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-card border border-border/50 ml-8">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">85% Pass Rate</p>
                        <p className="text-xs text-muted-foreground">Academic excellence</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
            <StatCard number="5,000+" label="Students" icon={<Users className="w-5 h-5 text-white" />} />
            <StatCard number="200+" label="Teachers" icon={<GraduationCap className="w-5 h-5 text-white" />} />
            <StatCard number="150+" label="Courses" icon={<BookOpen className="w-5 h-5 text-white" />} />
            <StatCard number="98%" label="Satisfaction" icon={<Star className="w-5 h-5 text-white" />} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete suite of tools for modern educational management
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-blue-600" />}
              title="Role-Based Access"
              desc="Admin, Teacher, and Student roles with tailored dashboards and permissions for each."
              color="bg-blue-100 dark:bg-blue-900/30"
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-purple-600" />}
              title="Course Management"
              desc="Create, manage, and assign courses to teachers with full CRUD operations."
              color="bg-purple-100 dark:bg-purple-900/30"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-green-600" />}
              title="Student Enrollment"
              desc="Students can browse and enroll in available courses with instant confirmation."
              color="bg-green-100 dark:bg-green-900/30"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-amber-600" />}
              title="Analytics & Reports"
              desc="Track enrollment stats, batch performance, and course popularity at a glance."
              color="bg-amber-100 dark:bg-amber-900/30"
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-rose-600" />}
              title="Instant Notifications"
              desc="Toast notifications for every action — enroll, update, or delete with feedback."
              color="bg-rose-100 dark:bg-rose-900/30"
            />
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6 text-indigo-600" />}
              title="Search & Filter"
              desc="Find students, courses, and teachers instantly with powerful search and filters."
              color="bg-indigo-100 dark:bg-indigo-900/30"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="gradient-hero absolute inset-0" />
            <div className="relative z-10 py-16 px-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Join thousands of students and educators already using Smart SMS.
              </p>
              {!user && (
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold gap-2">
                      Create Account <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground text-sm">Smart SMS</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 Smart Student Management System. Built for education.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
