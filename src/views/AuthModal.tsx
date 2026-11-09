import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { User, UserRole } from '../types';
import { isValidKenyanPhone } from '../utils/formatters';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  users: User[];
  onSelectUser: (user: User) => void;
  onCompleteSignUp: (userData: { name: string; email: string; phone: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  users,
  onSelectUser,
  onCompleteSignUp,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    owner: 'Business Owner',
    admin: 'Administrator',
    manager: 'Store Manager',
    salesperson: 'Salesperson',
    accountant: 'Accountant (CPA)',
    inventory_manager: 'Inventory Manager',
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your email or select a demo user below');
      return;
    }
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      onSelectUser(matched);
      onClose();
    } else {
      // Allow sign-in as demo owner for smooth testing
      onSelectUser(users[0]);
      onClose();
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (phone && !isValidKenyanPhone(phone)) {
      setError('Please enter a valid Kenyan phone number (e.g. 0712 345 678 or +254 712 345 678)');
      return;
    }
    onCompleteSignUp({ name, email, phone });
    onClose();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setResetSent(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'signin' 
          ? 'Sign in to BiasharaOS' 
          : mode === 'signup' 
          ? 'Create your BiasharaOS account' 
          : 'Reset your password'
      }
      subtitle={
        mode === 'signin'
          ? 'Select a demo role or sign in with your enterprise credentials'
          : mode === 'signup'
          ? 'Get started managing your Kenyan business operations'
          : 'We will send a reset link to your email address'
      }
      maxWidth="md"
    >
      {mode === 'signin' && (
        <div className="space-y-5">
          {/* 1-Click Fast Demo Role Login */}
          <div className="p-3 bg-[#F0F8F3] border border-[#00A651]/20 rounded-lg">
            <span className="text-[11px] font-bold text-[#00843D] uppercase tracking-wider block mb-1.5">
              1-Click Demo Profiles (Instant Sign In)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {users.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className="p-2 text-left bg-white hover:bg-neutral-50 rounded border border-[#E5EAE7] transition-all text-xs"
                >
                  <div className="font-semibold text-[#202B27] truncate">{u.name}</div>
                  <div className="text-[10px] text-[#00A651]">{roleLabels[u.role]}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5EAE7] w-full" />
            <span className="bg-white px-2 text-[11px] text-[#66736B] absolute uppercase">
              Or standard login
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@yourbusiness.co.ke"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#202B27]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#00A651] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="text-center text-xs text-[#66736B] pt-2 border-t border-[#E5EAE7]">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="font-semibold text-[#00A651] hover:underline"
            >
              Create Business Account
            </button>
          </div>
        </div>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Josphat Kamau"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              placeholder="josphat@simbahardware.co.ke"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Kenyan Mobile Number
            </label>
            <input
              type="tel"
              placeholder="0722 000 000 or +254 722 000 000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
              required
            />
            <span className="text-[10px] text-[#66736B] mt-0.5 block">
              Used for Safaricom M-Pesa account verification
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Choose Password
            </label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
          >
            Continue to Business Setup →
          </button>

          <div className="text-center text-xs text-[#66736B] pt-2 border-t border-[#E5EAE7]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="font-semibold text-[#00A651] hover:underline"
            >
              Sign In
            </button>
          </div>
        </form>
      )}

      {mode === 'forgot' && (
        <div className="space-y-4">
          {resetSent ? (
            <div className="p-4 bg-[#F0F8F3] border border-[#00A651]/20 rounded-lg text-center">
              <span className="text-xs font-semibold text-[#00843D] block mb-1">
                Password reset link sent!
              </span>
              <p className="text-xs text-[#66736B]">
                Check your inbox at <span className="font-medium text-[#202B27]">{email}</span> for instructions to reset your password.
              </p>
              <button
                onClick={() => { setResetSent(false); setMode('signin'); }}
                className="mt-4 px-4 py-1.5 bg-[#00A651] text-white text-xs font-semibold rounded-md"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@yourbusiness.co.ke"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
              >
                Send Reset Link
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-[#66736B] hover:text-[#202B27]"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};
