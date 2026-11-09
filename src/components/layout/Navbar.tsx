import React from 'react';

interface NavbarProps {
  onSignInClick: () => void;
  onGetStartedClick: () => void;
  onLaunchDemoClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSignInClick,
  onGetStartedClick,
  onLaunchDemoClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5EAE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <a href="#" className="flex items-center gap-2 whitespace-nowrap shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[#00A651] flex items-center justify-center text-white font-extrabold text-base tracking-tight shadow-xs">
              B
            </div>
            <span className="text-xl font-bold tracking-tight text-[#202B27]">
              Biashara<span className="text-[#00A651]">OS</span>
            </span>
          </a>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#66736B]">
            <a href="#features" className="hover:text-[#00A651] transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#solutions" className="hover:text-[#00A651] transition-colors whitespace-nowrap shrink-0">
              Solutions
            </a>
            <a href="#how-it-works" className="hover:text-[#00A651] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#00A651] transition-colors whitespace-nowrap shrink-0">
              Pricing (KES)
            </a>
            <a href="#faq" className="hover:text-[#00A651] transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Zone 3: 1 primary action + fast switch to demo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSignInClick}
              className="px-3.5 py-2 text-xs font-semibold text-[#202B27] hover:text-[#00A651] hover:bg-[#F0F8F3] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchDemoClick}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#00A651] hover:bg-[#00843D] active:scale-[0.98] rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              Launch Live App
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
