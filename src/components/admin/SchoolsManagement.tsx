import { SchoolsSection } from "./SchoolsSection";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { School } from "@/types/admin";

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

async function fetchSchools() {
  const { data, error } = await supabase
    .from('schools')
    .select(`
      id,
      name,
      created_at,
      classes (
        id,
        name,
        created_at,
        students (
          id,
          name,
          access_code,
          created_at,
          photos (
            id,
            url
          )
        )
      )
    `);

  if (error) throw error;
  return data || [];
}

async function createSchool(name: string) {
  const { error } = await supabase
    .from('schools')
    .insert([{ name }]);

  if (error) throw error;
}