import {
  Stethoscope,
  Heart,
  AlertTriangle,
  Building2,
  GraduationCap,
  PawPrint,
  Leaf,
  Briefcase,
  Users,
  Trophy,
  Palette,
  Calendar,
  HandHeart,
  Home,
  Plane,
  Star,
  Medal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CategoryWithCount } from "../types";

const categoryIcons: Record<string, LucideIcon> = {
  Medical: Stethoscope,
  Memorial: Heart,
  Emergency: AlertTriangle,
  Nonprofit: Building2,
  Education: GraduationCap,
  Animal: PawPrint,
  Environment: Leaf,
  Business: Briefcase,
  Community: Users,
  Competition: Trophy,
  Creative: Palette,
  Event: Calendar,
  Faith: HandHeart,
  Family: Home,
  Sports: Medal,
  Travel: Plane,
  Volunteer: Sparkles,
  Wishes: Star,
};

interface CategoryListProps {
  categories: CategoryWithCount[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h2 className="text-xl font-semibold mb-6 text-foreground">Browse fundraiser categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.name] || Star;
          return (
            <Link
              key={category.id}
              to="/discover/$category"
              params={{ category: category.name.toLowerCase() }}
              className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-accent-foreground/20 transition-colors cursor-pointer group"
            >
              <IconComponent className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-foreground">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
