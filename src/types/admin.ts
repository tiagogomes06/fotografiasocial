export interface School {
  id: string;
  name: string;
  classes: Class[];
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  accessCode: string;
  classId: string;
  photoUrl?: string;
}