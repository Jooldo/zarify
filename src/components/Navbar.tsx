
import { useNavigation } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  children?: React.ReactNode;
  className?: string;
}

const Navbar = ({ children, className }: NavbarProps) => {
  const { hideNavbar } = useNavigation();

  if (hideNavbar) {
    return null;
  }

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      {children}
    </nav>
  );
};

export default Navbar;
