import { SchoolsSection } from "./SchoolsSection";
import { ClassesSection } from "./ClassesSection";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { School, Class } from "@/types/admin";

export const SchoolsManagement = () => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const queryClient = useQueryClient();

  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools,
  });

  const schoolMutation = useMutation({
    mutationFn: (values: { schoolName: string }) => createSchool(values.schoolName),
    onSuccess: () => {
      toast.success("Escola adicionada com sucesso");
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      toast.error("Erro ao adicionar escola");
      console.error(error);
    },
  });

  const classMutation = useMutation({
    mutationFn: async (values: { className: string }) => {
      if (!selectedSchool) throw new Error("No school selected");
      const { data, error } = await supabase
        .from('classes')
        .insert([{ name: values.className, school_id: selectedSchool.id }])
        .select(`
          id,
          name,
          school_id,
          created_at,
          students (
            id,
            name,
            access_code,
            class_id,
            created_at,
            photos (
              id,
              url
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newClass) => {
      toast.success("Turma adicionada com sucesso");
      // Update the selected school with the new class
      if (selectedSchool) {
        setSelectedSchool({
          ...selectedSchool,
          classes: [...selectedSchool.classes, newClass],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error) => {
      toast.error("Erro ao adicionar turma");
      console.error(error);
    },
  });

  if (selectedSchool) {
    return (
      <ClassesSection
        school={selectedSchool}
        onAddClass={(values) => classMutation.mutate(values)}
        onSelectClass={() => {}}
        onBack={() => setSelectedSchool(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <SchoolsSection
        schools={schools}
        onAddSchool={(values) => schoolMutation.mutate(values)}
        onSelectSchool={setSelectedSchool}
      />
    </div>
  );
};

async function fetchSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from('schools')
    .select(`
      id,
      name,
      created_at,
      classes (
        id,
        name,
        school_id,
        created_at,
        students (
          id,
          name,
          access_code,
          class_id,
          created_at,
          photos (
            id,
            url
          )
        )
      )
    `);

  if (error) throw error;

  return (data || []).map(school => ({
    ...school,
    classes: school.classes.map(cls => ({
      ...cls,
      students: cls.students.map(student => ({
        ...student,
        photoUrl: student.photos?.[0]?.url
      }))
    }))
  }));
}

async function createSchool(name: string) {
  const { error } = await supabase
    .from('schools')
    .insert([{ name }]);

  if (error) throw error;
}