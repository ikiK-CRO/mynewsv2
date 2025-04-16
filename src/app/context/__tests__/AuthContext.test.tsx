import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase auth
jest.mock('../../firebase/config', () => ({
  auth: {}
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  sendEmailVerification: jest.fn()
}));

// Test component to access the AuthContext values
const TestComponent = () => {
  const { user, loading, signIn, signUp, logOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button 
        data-testid="login-button" 
        onClick={() => signIn('test@example.com', 'password123')}
      >
        Login
      </button>
      <button 
        data-testid="signup-button" 
        onClick={() => signUp('new@example.com', 'password456', 'John', 'Doe')}
      >
        Signup
      </button>
      <button 
        data-testid="logout-button" 
        onClick={() => logOut()}
      >
        Logout
      </button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  let authChangedCallback: Function | null = null;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock onAuthStateChanged to capture and store the callback function
    (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authChangedCallback = callback;
      return jest.fn(); // Return a mock unsubscribe function
    });
    
    // Mock the authentication methods
    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', emailVerified: true }
    });
    
    (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { email: 'new@example.com' }
    });
    
    (firebaseAuth.updateProfile as jest.Mock).mockResolvedValue(undefined);
    (firebaseAuth.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
    
    // Mock getAuth to return a mock auth object
    (firebaseAuth.getAuth as jest.Mock).mockReturnValue({});
  });
  
  it('initializes with loading true and no user', () => {
    renderWithAuthProvider();
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });
  
  it('updates state when auth state changes', async () => {
    renderWithAuthProvider();
    
    // Simulate Firebase auth state change
    await act(async () => {
      if (authChangedCallback) {
        authChangedCallback({ email: 'test@example.com' }); // Simulate logged-in user
      }
    });
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });
  
  it('calls Firebase signInWithEmailAndPassword when signIn is called', async () => {
    renderWithAuthProvider();
    
    // Click login button
    await userEvent.click(screen.getByTestId('login-button'));
    
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
  });
  
  it('calls Firebase createUserWithEmailAndPassword when signUp is called', async () => {
    renderWithAuthProvider();
    
    // Click signup button
    await userEvent.click(screen.getByTestId('signup-button'));
    
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'new@example.com',
      'password456'
    );
    
    // Check if updateProfile was called
    expect(firebaseAuth.updateProfile).toHaveBeenCalled();
  });
  
  it('calls Firebase signOut when logOut is called', async () => {
    renderWithAuthProvider();
    
    // Click logout button
    await userEvent.click(screen.getByTestId('logout-button'));
    
    expect(firebaseAuth.signOut).toHaveBeenCalled();
  });
}); 