import type { LucideIcon } from "lucide-react";

export interface IconCardItem {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface Fundraiser {
    id: string;
    name: string;
    title: string;
    description: string;
    raised: number;
    goal: number;
    imageUrl: string;
}

export interface HeroContent {
    title: string;
    description: string;
    ctaText: string;
    imageUrl: string;
    imageAlt: string;
}

export interface Step {
    step: string;
    title: string;
    description: string;
    visual: React.ReactNode;
}
