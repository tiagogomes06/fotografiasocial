export interface School {
  id: string;
  name: string;
  created_at: string;
  classes: Class[];
}

export interface Class {
  id: string;
  name: string;
  school_id: string;
  created_at: string;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  access_code: string;
  class_id: string;
  created_at: string;
  photoUrl?: string;
  photos?: { id: string; url: string; }[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

export interface CartItem {
  photoUrl: string;
  productId: string;
  price: number;
  studentId: string;
  photoId: string;
  quantity?: number;
}