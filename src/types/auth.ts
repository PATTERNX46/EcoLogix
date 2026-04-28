export type UserRole = 
  | 'admin' 
  | 'logistics_manager' 
  | 'supplier' 
  | 'fleet_operator' 
  | 'government' 
  | 'analyst';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
}