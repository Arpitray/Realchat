"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import React, { useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed top-4 z-40 w-full px-4", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
            child as React.ReactElement<{ visible?: boolean }>,
            { visible },
          )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? "50%" : "100%",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "300px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-6 py-3 lg:flex glass",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium transition duration-200 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-white/10"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </Link>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? "95%" : "100%",
        borderRadius: visible ? "1rem" : "2rem",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between glass rounded-full px-4 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute inset-x-0 top-20 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl glass px-4 py-8",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-foreground" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-foreground" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
    >
      <span className="font-bold text-2xl text-gradient">Bando</span>
    </Link>
  );
};

export const AuthSection = ({ className }: { className?: string }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <div className="text-foreground font-medium text-sm">
          {session.user?.name || session.user?.email}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="py-2 px-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-full text-sm font-semibold hover:bg-red-500/20 transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Link
        href="/auth/login"
        className="py-2 px-4 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/auth/register"
        className="py-2 px-4 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25"
      >
        Sign up
      </Link>
    </div>
  );
};

export const MobileAuthSection = ({ className, onItemClick }: { className?: string; onItemClick?: () => void }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className={cn("flex items-center justify-center py-2", className)}>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className={cn("flex flex-col items-center space-y-3 w-full", className)}>
        <div className="text-foreground font-medium text-center">
          {session.user?.name || session.user?.email}
        </div>
        <button
          onClick={() => {
            signOut({ callbackUrl: '/' });
            onItemClick?.();
          }}
          className="w-full py-2 px-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl font-semibold hover:bg-red-500/20 transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center space-y-2 w-full", className)}>
      <Link
        href="/auth/login"
        onClick={onItemClick}
        className="w-full text-center py-2 px-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all duration-200"
      >
        Sign in
      </Link>
      <Link
        href="/auth/register"
        onClick={onItemClick}
        className="w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200"
      >
        Sign up
      </Link>
    </div>
  );
};

export const ResizableNavbar = () => {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  if (pathname?.startsWith("/whiteboard") || pathname?.startsWith("/chat")) {
    return null;
  }

  const navItems = [
    { name: "Features", link: "/#features" },
    { name: "Dashboard", link: "/dashboard" },
  ];

  return (
    <Navbar className="fixed top-5 inset-x-0 z-50 pointer-events-none">
      <NavBody visible={true} className="pointer-events-auto">
        <div className="flex w-full items-center justify-between">
          <NavbarLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavItems items={navItems} />
            <ThemeToggle />
            <AuthSection />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <MobileNavToggle
              isOpen={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            />
          </div>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav visible={isMobileNavOpen} className="pointer-events-auto">
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        >
          <div className="flex flex-col space-y-4 w-full">
            <NavItems
              items={navItems}
              onItemClick={() => setIsMobileNavOpen(false)}
              className="flex flex-col space-y-2 !items-start !justify-start"
            />

            <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
              <div className="flex justify-start">
                 <ThemeToggle />
              </div>
              <MobileAuthSection onItemClick={() => setIsMobileNavOpen(false)} />
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
