import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
    completedSteps?: Set<number>;
    className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, completedSteps = new Set(), className }: StepperProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = currentStep === index;
                    const isCompleted = completedSteps.has(index);
                    const Icon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            <div
                                className={cn(
                                    "flex flex-col items-center flex-1 cursor-pointer group transition-all",
                                    onStepClick && "hover:scale-105"
                                )}
                                onClick={() => onStepClick?.(index)}
                            >
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 mb-2",
                                        isActive && "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/50 scale-110",
                                        isCompleted && !isActive && "border-emerald-500 bg-emerald-500 text-white",
                                        !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400 group-hover:border-amber-300"
                                    )}
                                >
                                    {isCompleted && !isActive ? (
                                        <Check className="w-6 h-6" />
                                    ) : Icon ? (
                                        <Icon className="w-6 h-6" />
                                    ) : (
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                    )}

                                    {/* Active Ring */}
                                    {isActive && (
                                        <span className="absolute inset-0 rounded-full border-2 border-amber-500 animate-ping opacity-75" />
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="text-center">
                                    <p
                                        className={cn(
                                            "text-sm font-medium transition-colors",
                                            isActive && "text-amber-600 dark:text-amber-400",
                                            isCompleted && !isActive && "text-emerald-600 dark:text-emerald-400",
                                            !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-gray-400 mt-1 max-w-[120px]">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 mb-8">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            isCompleted ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile Stepper - Compact Horizontal */}
            <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {steps.map((step, index) => {
                    const isActive = currentStep === index;
                    const isCompleted = completedSteps.has(index);
                    const Icon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => onStepClick?.(index)}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all",
                                    isActive && "scale-110"
                                )}
                            >
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                                        isActive && "border-amber-500 bg-amber-500 text-white shadow-md",
                                        isCompleted && !isActive && "border-emerald-500 bg-emerald-500 text-white",
                                        !isActive && !isCompleted && "border-gray-300 bg-white dark:bg-gray-700 text-gray-400"
                                    )}
                                >
                                    {isCompleted && !isActive ? (
                                        <Check className="w-5 h-5" />
                                    ) : Icon ? (
                                        <Icon className="w-5 h-5" />
                                    ) : (
                                        <span className="text-xs font-semibold">{index + 1}</span>
                                    )}
                                </div>

                                {/* Step Label - Show only for active */}
                                <span
                                    className={cn(
                                        "text-[10px] font-medium max-w-[60px] text-center leading-tight",
                                        isActive ? "text-amber-600 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </button>

                            {/* Connector Dot */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 flex items-center justify-center mb-6">
                                    <div
                                        className={cn(
                                            "w-full h-1 rounded-full transition-all",
                                            isCompleted ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-600"
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
