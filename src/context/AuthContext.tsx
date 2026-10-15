import { createContext } from "react";

export type AuthUser = {
  _id: string;
  name: string;
  username: string;
  email: string;
  photo: string;
  cover: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  createdAt?: string;
};

export type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
