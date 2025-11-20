interface StepCardProps {
    step: string;
    title: string;
    description: string;
    children: React.ReactNode;
}

export function StepCard({ step, title, description, children }: StepCardProps) {
    return (
        <div className="bg-[#f8f8f6] rounded-2xl p-6 flex flex-col h-full">
            <div className="text-primary font-bold text-sm mb-4">{step}</div>
            <div className="mb-6">{children}</div>
            <h3 className="text-2xl font-bold mb-4 text-[#2a2e30] leading-tight">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}
