import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { School, Class } from "@/types/admin";
import { createSchool, createClass, createStudent, fetchSchools } from "@/utils/supabaseHelpers";
import { SchoolsSection } from "@/components/admin/SchoolsSection";
import { ClassesSection } from "@/components/admin/ClassesSection";
import { StudentsSection } from "@/components/admin/StudentsSection";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const queryClient = useQueryClient();
  
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools,
  });

  // Subscribe to all relevant tables for real-time updates
  useEffect(() => {
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'schools'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'classes'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'students'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'photos'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  // Update selected entities when data changes
  useEffect(() => {
    if (selectedSchool) {
      const updatedSchool = schools.find(school => school.id === selectedSchool.id);
      if (updatedSchool) {
        setSelectedSchool(updatedSchool);
        
        // If we have a selected class, update it with the new data
        if (selectedClass) {
          const updatedClass = updatedSchool.classes.find(cls => cls.id === selectedClass.id);
          if (updatedClass) {
            setSelectedClass(updatedClass);
          }
        }
      }
    }
  }, [schools, selectedSchool?.id, selectedClass?.id]);

  const schoolMutation = useMutation({
    mutationFn: (values: { schoolName: string }) => createSchool(values.schoolName),
    onSuccess: () => {
      toast.success("School added successfully");
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      toast.error("Failed to add school");
      console.error(error);
    },
  });

  const classMutation = useMutation({
    mutationFn: (values: { className: string }) => {
      if (!selectedSchool) throw new Error("No school selected");
      return createClass(values.className, selectedSchool.id);
    },
    onSuccess: () => {
      toast.success("Class added successfully");
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      toast.error("Failed to add class");
      console.error(error);
    },
  });

  const studentMutation = useMutation({
    mutationFn: (values: { studentName: string }) => {
      if (!selectedClass) throw new Error("No class selected");
      const accessCode = generateAccessCode();
      return createStudent(values.studentName, selectedClass.id, accessCode);
    },
    onSuccess: () => {
      toast.success("Student added successfully");
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      toast.error("Failed to add student");
      console.error(error);
    },
  });

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handlePhotoUploaded = async () => {
    await queryClient.invalidateQueries({ queryKey: ['schools'] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="py-4 md:py-6 px-4 border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
        <div className="container flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container pt-24 md:pt-32 pb-8 md:pb-16 px-4 space-y-6 md:space-y-8">
        {!selectedSchool && (
          <SchoolsSection
            schools={schools}
            onAddSchool={(values) => schoolMutation.mutate(values)}
            onSelectSchool={setSelectedSchool}
          />
        )}

        {selectedSchool && !selectedClass && (
          <ClassesSection
            school={selectedSchool}
            onAddClass={(values) => classMutation.mutate(values)}
            onSelectClass={setSelectedClass}
            onBack={() => setSelectedSchool(null)}
          />
        )}

        {selectedClass && (
          <StudentsSection
            selectedClass={selectedClass}
            onAddStudent={(values) => studentMutation.mutate(values)}
            onBack={() => setSelectedClass(null)}
            onPhotoUploaded={handlePhotoUploaded}
          />
        )}
      </main>
      <Toaster />
    </div>
  );
};

export default Admin;