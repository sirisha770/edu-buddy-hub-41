import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Users, Search, X, Loader2, GraduationCap } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Course {
  id: string; title: string; code: string; description: string | null; credits: number | null; teacher_id: string | null;
}
interface Enrollment {
  id: string; student_id: string; course_id: string; enrolled_at: string; profiles?: { full_name: string; email: string; batch: string | null; };
}

const TeacherDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (coursesData) setCourses(coursesData);
    } catch {
      toast({ title: 'Error', description: 'Failed to load courses.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (courseId: string) => {
    setEnrollLoading(true);
    try {
      const { data } = await supabase
        .from('enrollments')
        .select('*, profiles(*)')
        .eq('course_id', courseId);
      if (data) setEnrollments(data as any);
    } catch {
      toast({ title: 'Error', description: 'Failed to load enrollments.', variant: 'destructive' });
    } finally {
      setEnrollLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  useEffect(() => {
    if (selectedCourse) fetchEnrollments(selectedCourse.id);
    else setEnrollments([]);
  }, [selectedCourse]);

  const filteredEnrollments = enrollments.filter(e => {
    const p = e.profiles;
    if (!search) return true;
    return p?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p?.batch?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DashboardLayout title="Teacher Dashboard" role="teacher">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome, {profile?.full_name || 'Teacher'} 👋</h2>
        <p className="text-muted-foreground mt-1">Manage your assigned courses and view enrolled students.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="border border-border/50 shadow-card">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">My Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-card">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{selectedCourse ? enrollments.length : '—'}</p>
              <p className="text-sm text-muted-foreground">{selectedCourse ? 'Enrolled Students' : 'Select a course'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Courses List */}
        <Card className="border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">My Courses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No courses assigned yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Contact your administrator.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${selectedCourse?.id === course.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/30'}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.code} • {course.credits} credits</p>
                      {course.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{course.description}</p>}
                    </div>
                    {selectedCourse?.id === course.id && <Badge className="gradient-hero text-white border-0 text-xs flex-shrink-0">Selected</Badge>}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Panel */}
        <Card className="border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {selectedCourse ? `Students — ${selectedCourse.title}` : 'Enrolled Students'}
              {selectedCourse && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)} className="h-6 w-6 p-0">
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </CardTitle>
            {selectedCourse && (
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {!selectedCourse ? (
              <div className="text-center py-10">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a course to view enrolled students.</p>
              </div>
            ) : enrollLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{search ? 'No matching students.' : 'No students enrolled yet.'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEnrollments.map(e => {
                  const p = e.profiles;
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                      <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{p?.full_name?.[0] || 'S'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground truncate">{p?.email} {p?.batch ? `• ${p.batch}` : ''}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">Active</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
