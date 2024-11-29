export interface School {
  id: string;
  name: string;
  classes: Class[];
  created_at?: string;
}

export interface Class {
  id: string;
  name: string;
  school_id: string;
  students: Student[];
  created_at?: string;
}

export interface Student {
  id: string;
  name: string;
  access_code: string;
  class_id: string;
  photoUrl?: string;
  created_at?: string;
}