import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Search, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Course { id: string; title: string; code: string; description: string | null; credits: number | null; teacher_id: string | null; }
interface TeacherProfile { user_id: string; full_name: string; }

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [coursesRes, teachersRes] = await Promise.all([
        supabase.from('courses').select('*').order('title'),
        supabase.from('profiles').select('user_id, full_name'),
      ]);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (teachersRes.data) setTeachers(teachersRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const getTeacher = (teacherId: string | null) =>
    teachers.find(t => t.user_id === teacherId)?.full_name || 'TBA';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Catalog</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore all available courses at our institution. Login to enroll.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{search ? 'No courses match your search.' : 'No courses available yet.'}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(course => (
                <Card key={course.id} className="border border-border/50 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground leading-snug">{course.title}</h3>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{course.code}</Badge>
                    </div>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {getTeacher(course.teacher_id)}
                      </span>
                      <Badge variant="secondary" className="text-xs">{course.credits} credit{course.credits !== 1 ? 's' : ''}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CoursesPage;
