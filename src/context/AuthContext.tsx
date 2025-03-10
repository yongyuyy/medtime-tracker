import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  groupIds?: string[];
  profileImage?: string;
}

export interface Group {
  id: string;
  name: string;
  passcode: string;
  department: string;
  createdBy: string;
  members: User[];
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  groups: Group[];
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  createGroup: (name: string, department: string, passcode: string) => Promise<void>;
  joinGroup: (groupId: string, passcode: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'dr.smith@hospital.com',
    name: 'Dr. Smith',
    role: 'Consultant',
    department: 'Cardiology',
    groupIds: ['group-1']
  },
  {
    id: 'user-2',
    email: 'dr.jones@hospital.com',
    name: 'Dr. Jones',
    role: 'Registrar',
    department: 'Cardiology',
    groupIds: ['group-1']
  }
];

const MOCK_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: 'Cardiology Team 1',
    passcode: '123456',
    department: 'Cardiology',
    createdBy: 'user-1',
    members: MOCK_USERS,
    createdAt: '2025-01-15T12:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    groups: [],
    isLoading: true
  });

  useEffect(() => {
    // Check for saved auth in localStorage
    const savedAuth = localStorage.getItem('medtime-auth');
    
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setState({
          ...authData,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to parse saved auth data', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('medtime-auth', JSON.stringify({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        groups: state.groups
      }));
    }
  }, [state.user, state.isAuthenticated, state.groups, state.isLoading]);

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (user) {
        setState({
          user,
          isAuthenticated: true,
          groups: MOCK_GROUPS.filter(g => user.groupIds?.includes(g.id)),
          isLoading: false
        });
        toast.success('Logged in successfully');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email is already taken
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already taken');
      }
      
      // Create new user
      const newUser: User = {
        id: 'user-' + Date.now(),
        email,
        name,
        role,
        groupIds: []
      };
      
      // Add to mock users (for demo)
      MOCK_USERS.push(newUser);
      
      setState({
        user: newUser,
        isAuthenticated: true,
        groups: [],
        isLoading: false
      });
      
      toast.success('Account created successfully');
    } catch (error) {
      toast.error('Signup failed: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      groups: [],
      isLoading: false
    });
    localStorage.removeItem('medtime-auth');
    toast.success('Logged out successfully');
  };

  const createGroup = async (name: string, department: string, passcode: string) => {
    if (!state.user) {
      toast.error('You must be logged in to create a group');
      return;
    }
    
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup: Group = {
        id: 'group-' + Date.now(),
        name,
        department,
        passcode,
        createdBy: state.user.id,
        members: [state.user],
        createdAt: new Date().toISOString()
      };
      
      // Add to mock groups (for demo)
      MOCK_GROUPS.push(newGroup);
      
      // Update current user's groups
      const updatedUser = {
        ...state.user,
        groupIds: [...(state.user.groupIds || []), newGroup.id]
      };
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        groups: [...prev.groups, newGroup],
        isLoading: false
      }));
      
      toast.success('Group created successfully');
    } catch (error) {
      toast.error('Failed to create group: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const joinGroup = async (groupId: string, passcode: string) => {
    if (!state.user) {
      toast.error('You must be logged in to join a group');
      return;
    }
    
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find group
      const group = MOCK_GROUPS.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      if (group.passcode !== passcode) {
        throw new Error('Invalid passcode');
      }
      
      // Check if user is already a member
      if (group.members.some(m => m.id === state.user?.id)) {
        throw new Error('You are already a member of this group');
      }
      
      // Add user to group
      group.members.push(state.user);
      
      // Update user's groups
      const updatedUser = {
        ...state.user,
        groupIds: [...(state.user.groupIds || []), group.id]
      };
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        groups: [...prev.groups, group],
        isLoading: false
      }));
      
      toast.success(`Joined ${group.name} successfully`);
    } catch (error) {
      toast.error('Failed to join group: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!state.user) {
      toast.error('You must be logged in to leave a group');
      return;
    }
    
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find group
      const group = MOCK_GROUPS.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is a member
      if (!group.members.some(m => m.id === state.user?.id)) {
        throw new Error('You are not a member of this group');
      }
      
      // Remove user from group
      group.members = group.members.filter(m => m.id !== state.user?.id);
      
      // Update user's groups
      const updatedUser = {
        ...state.user,
        groupIds: (state.user.groupIds || []).filter(id => id !== groupId)
      };
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        groups: prev.groups.filter(g => g.id !== groupId),
        isLoading: false
      }));
      
      toast.success(`Left ${group.name} successfully`);
    } catch (error) {
      toast.error('Failed to leave group: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!state.user) {
      toast.error('You must be logged in to delete a group');
      return;
    }
    
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find group
      const group = MOCK_GROUPS.find(g => g.id === groupId);
      
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if user is the creator
      if (group.createdBy !== state.user.id) {
        throw new Error('Only the group creator can delete this group');
      }
      
      // Remove group from all members
      group.members.forEach(member => {
        const userToUpdate = MOCK_USERS.find(u => u.id === member.id);
        if (userToUpdate) {
          userToUpdate.groupIds = userToUpdate.groupIds?.filter(id => id !== groupId);
        }
      });
      
      // Remove group from mock groups
      const groupIndex = MOCK_GROUPS.findIndex(g => g.id === groupId);
      if (groupIndex !== -1) {
        MOCK_GROUPS.splice(groupIndex, 1);
      }
      
      // Update user's groups
      const updatedUser = {
        ...state.user,
        groupIds: (state.user.groupIds || []).filter(id => id !== groupId)
      };
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        groups: prev.groups.filter(g => g.id !== groupId),
        isLoading: false
      }));
      
      toast.success(`Group "${group.name}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete group: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!state.user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      // Simulate API call
      setState(prev => ({ ...prev, isLoading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...state.user,
        ...userData
      };
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile: ' + (error as Error).message);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      createGroup,
      joinGroup,
      leaveGroup,
      deleteGroup,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
