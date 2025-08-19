import React from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';

interface VisibilityOption {
    value: string;
    label: string;
    description: string;
    icon: string;
}

interface VisibilitySelectorProps {
    value: string;
    onChange: (value: string) => void;
    options: VisibilityOption[];
}

export default function VisibilitySelector({ value, onChange, options }: VisibilitySelectorProps) {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium">Visibilité du profil</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option) => (
                    <Card 
                        key={option.value}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                            value === option.value 
                                ? 'ring-2 ring-blue-500 border-blue-500' 
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => onChange(option.value)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">{option.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value={option.value}
                                            checked={value === option.value}
                                            onChange={(e) => onChange(e.target.value)}
                                            className="sr-only"
                                        />
                                        <h3 className="font-medium text-gray-900">
                                            {option.label}
                                        </h3>
                                        {value === option.value && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}