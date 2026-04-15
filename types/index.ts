export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  role?: string;
  subscription_tier?: string;
  ads_disabled?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  color: NoteColor;
  is_pinned: boolean;
  is_archived: boolean;
  tags: string[];
  reminder_date?: string; // ISO string
  folder?: string; // e.g., 'Main', 'Google Notes', 'iCloud Notes'
  created_at: string;
  updated_at: string;
  share_slug?: string; // short public slug for shared notes
  is_shared?: boolean; // true if the note is publicly accessible
  share_type?: 'public' | 'password' | 'encrypted'; // type of sharing
  share_permission?: 'read' | 'write'; // guest access level
  is_discoverable?: boolean; // true if the note is publicly listed in /discovery
  is_password_protected?: boolean;
  password_salt?: string; // salt for key derivation
  is_encrypted?: boolean; // true if content is encrypted (AES-GCM)
  note_type?: 'text' | 'pdf' | 'spreadsheet' | 'google_doc' | 'github_clone';
  external_meta?: {
    url?: string;
    file_id?: string;
    repo_url?: string;
    last_synced?: string;
    is_snapshot?: boolean;
    [key: string]: any;
  };
  external_source_url?: string;
  external_source_type?: string;
  external_source_title?: string;
  category?: NoteCategory;
}

export type NoteCategory = 'General' | 'Education' | 'Work' | 'Code' | 'Personal' | 'Other';

export interface NoteRating {
  id: string;
  note_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface NoteComment {
  id: string;
  note_id: string;
  user_id: string;
  user_email?: string;
  content: string;
  parent_id?: string;
  created_at: string;
}

export interface NoteLog {
  id: string;
  note_id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  details: any;
  created_at: string;
}

export interface NoteCollaborator {
  id: string;
  note_id: string;
  email: string;
  permission: 'read' | 'write';
  created_at: string;
}

export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink';

export interface NoteColorOption {
  value: NoteColor;
  label: string;
  bg: string;
  border: string;
}

export const NOTE_COLORS: NoteColorOption[] = [
  { value: 'default', label: 'Default', bg: 'bg-card', border: 'border-border' },
  { value: 'red', label: 'Red', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-900/50' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-900/50' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-900/50' },
  { value: 'green', label: 'Green', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-900/50' },
  { value: 'teal', label: 'Teal', bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-200 dark:border-teal-900/50' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/50' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-900/50' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-900/50' },
];

export type ViewMode = 'grid' | 'list';
export type SortOption = 'updated' | 'created' | 'title';
