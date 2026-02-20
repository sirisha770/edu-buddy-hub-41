import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, User, Loader2, PlusCircle, Trash2, GraduationCap } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Course { id: string; title: string; code: string; description: string | null; credits: number | null; teacher_id: string | null; }
interface Enrollment { id: string; course_id: string; enrolled_at: string; }
interface Profile { full_name: string; email: string; phone: string | null; batch: string | null; }

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        supabase.from('courses').select('*').order('title'),
        supabase.from('enrollments').select('*').eq('student_id', user.id),
      ]);
      if (coursesRes.data) setAllCourses(coursesRes.data);
      if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const enroll = async (courseId: string) => {
    if (!user) return;
    setActionLoading(courseId);
    try {
      const { error } = await supabase.from('enrollments').insert({ student_id: user.id, course_id: courseId });
      if (error) throw error;
      toast({ title: 'Enrolled!', description: 'You have been enrolled in the course.' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Enrollment failed.', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const unenroll = async (courseId: string) => {
    if (!user || !confirm('Unenroll from this course?')) return;
    setActionLoading(courseId);
    try {
      const { error } = await supabase.from('enrollments').delete().eq('student_id', user.id).eq('course_id', courseId);
      if (error) throw error;
      toast({ title: 'Unenrolled', description: 'You have been removed from the course.' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
  const enrolledCourses = allCourses.filter(c => enrolledCourseIds.has(c.id));
  const availableCourses = allCourses.filter(c => !enrolledCourseIds.has(c.id));

  return (
    <DashboardLayout title="Student Dashboard" role="student">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome, {profile?.full_name || 'Student'} 👋</h2>
        <p className="text-muted-foreground mt-1">View your courses and explore new ones.</p>
      </div>

      {/* Profile Card */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="border border-border/50 shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />My Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-white text-xl font-bold">
                {profile?.full_name?.[0] || 'S'}
              </div>
              <div>
                <p className="font-semibold">{profile?.full_name || '—'}</p>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span>{profile?.phone || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Batch</span>
                <span>{profile?.batch || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Enrolled Courses</span>
                <Badge variant="secondary">{enrollments.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="border border-border/50 shadow-card">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-card">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{availableCourses.length}</p>
              <p className="text-sm text-muted-foreground">Available Courses</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Courses */}
      <Card className="border border-border/50 shadow-card">
        <CardHeader className="pb-2">
          <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
            {(['enrolled', 'available'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab} ({tab === 'enrolled' ? enrolledCourses.length : availableCourses.length})
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'enrolled' ? enrolledCourses : availableCourses).map(course => (
                <div key={course.id} className="rounded-xl border border-border/50 p-4 hover:shadow-card transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{course.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{course.code} • {course.credits} credits</p>
                  {course.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>}
                  <div className="mt-3">
                    {activeTab === 'enrolled' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/5 text-xs"
                        onClick={() => unenroll(course.id)}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5 mr-1" />Unenroll</>}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full gradient-hero border-0 text-white text-xs"
                        onClick={() => enroll(course.id)}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><PlusCircle className="w-3.5 h-3.5 mr-1" />Enroll</>}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {(activeTab === 'enrolled' ? enrolledCourses : availableCourses).length === 0 && (
                <div className="col-span-full flex flex-col items-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">
                    {activeTab === 'enrolled' ? "You haven't enrolled in any courses yet." : "No more courses available."}
                  </p>
                  {activeTab === 'enrolled' && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setActiveTab('available')}>
                      Browse Available Courses
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;
