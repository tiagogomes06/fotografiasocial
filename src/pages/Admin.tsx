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

  // Set up real-time subscriptions with immediate updates
  useEffect(() => {
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'schools' 
      }, async () => {
        const updatedData = await fetchSchools();
        queryClient.setQueryData(['schools'], updatedData);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'classes' 
      }, async () => {
        const updatedData = await fetchSchools();
        queryClient.setQueryData(['schools'], updatedData);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'students' 
      }, async () => {
        const updatedData = await fetchSchools();
        queryClient.setQueryData(['schools'], updatedData);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'photos' 
      }, async () => {
        const updatedData = await fetchSchools();
        queryClient.setQueryData(['schools'], updatedData);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const schoolMutation = useMutation({
    mutationFn: (values: { schoolName: string }) => createSchool(values.schoolName),
    onSuccess: async () => {
      toast.success("School added successfully");
      const updatedData = await fetchSchools();
      queryClient.setQueryData(['schools'], updatedData);
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
    onSuccess: async () => {
      toast.success("Class added successfully");
      const updatedData = await fetchSchools();
      queryClient.setQueryData(['schools'], updatedData);
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
    onSuccess: async () => {
      toast.success("Student added successfully");
      const updatedData = await fetchSchools();
      queryClient.setQueryData(['schools'], updatedData);
    },
    onError: (error) => {
      toast.error("Failed to add student");
      console.error(error);
    },
  });

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handlePhotoUploaded = async (studentId: string, photoUrl: string) => {
    const updatedData = await fetchSchools();
    queryClient.setQueryData(['schools'], updatedData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-4 border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container pt-32 pb-16 space-y-8">
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
    </div>
  );
};

export default Admin;