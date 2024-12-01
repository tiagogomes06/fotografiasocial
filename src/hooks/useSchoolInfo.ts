import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSchoolInfo = () => {
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "", className: "" });

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        if (!studentId) return;

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('class_id')
          .eq('id', studentId)
          .single();

        if (studentError) {
          console.error('Error fetching student:', studentError);
          return;
        }

        if (!studentData?.class_id) return;

        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select(`
            name,
            schools!inner (
              name
            )
          `)
          .eq('id', studentData.class_id)
          .single();

        if (classError) {
          console.error('Error fetching class:', classError);
          return;
        }

        if (classData) {
          setSchoolInfo({
            schoolName: classData.schools.name,
            className: classData.name
          });
        }
      } catch (error) {
        console.error('Error in fetchSchoolInfo:', error);
      }
    };

    fetchSchoolInfo();
  }, []);

  return schoolInfo;
};