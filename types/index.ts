export interface ClassroomCompany {
  id: string;
  name_th?: string;
  name_en?: string;
}

export interface ClassroomSchool {
  id: string;
  name_th?: string;
  name_en?: string;
}

export interface ClassroomTeacher {
  id: string;
  first_name_th?: string;
  last_name_th?: string;
  email?: string;
}

export interface ProfileSummary {
  id: string;
  email: string;
  full_name: string;
  student_id?: string;
  class_year?: number;
  avatar_url?: string;
  company?: ClassroomCompany | null;
  school?: ClassroomSchool | null;
  teacher?: ClassroomTeacher | null;
}

export interface Comment {
  id: string;
  status_id: string;
  body: string;
  created_at: string;
  owner: ProfileSummary;
}

export interface StatusItem {
  id: string;
  body: string;
  created_at: string;
  owner: ProfileSummary;
  like_count: number;
  is_liked: boolean;
  comments: Comment[];
}

export interface ClassroomMember extends ProfileSummary {
  contact?: string;
  bio?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}