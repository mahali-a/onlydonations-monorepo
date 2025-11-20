interface IconCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export function IconCard({ icon, title, description }: IconCardProps) {
    return (
        <div className="bg-[#f3f1eb] rounded-3xl p-10 md:p-12 flex flex-col snap-start h-full">
            <div className="mb-8">{icon}</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#2a2e30] tracking-tight">
                {title}
            </h3>
            <p className="text-[#4a4a4a] leading-relaxed text-lg md:text-[1.15rem]">
                {description}
            </p>
        </div>
    );
}
