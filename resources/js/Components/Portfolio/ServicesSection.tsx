import React from 'react';
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { Star } from 'lucide-react';

interface Service {
    id: number;
    title: string;
    description: string;
    short_description?: string;
    main_image_url?: string;
    icon?: string;
    price?: number;
    price_type: string;
    tags?: string[];
    is_featured: boolean;
    is_active: boolean;
    formatted_price?: string;
    images?: ServiceImage[];
}

interface ServiceImage {
    id: number;
    url: string;
    thumbnail_url: string;
    alt_text?: string;
    caption?: string;
    is_main: boolean;
}

interface Props {
    services: Service[];
    design?: string;
    primaryColor?: string;
}

export default function ServicesSection({ services, design = 'professional', primaryColor = '#f59e0b' }: Props) {
    const activeServices = services.filter(service => service.is_active);
    
    if (!activeServices.length) {
        return null;
    }

    return (
        <section className="mb-12">
            <div className="mb-6">
                <h2 
                    className="text-2xl font-bold mb-2" 
                    style={{ color: primaryColor }}
                >
                    Services
                </h2>
                <div 
                    className="w-16 h-1 rounded"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeServices.map((service) => (
                    <ServiceCard 
                        key={service.id}
                        service={service}
                        design={design}
                        primaryColor={primaryColor}
                    />
                ))}
            </div>
        </section>
    );
}

function ServiceCard({ service, design, primaryColor }: { service: Service; design: string; primaryColor: string }) {
    const cardStyles = {
        professional: "bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow",
        creative: "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1",
        minimal: "bg-white border border-gray-100 rounded-md hover:border-gray-200 transition-colors",
        modern: "bg-white border-l-4 rounded-r-lg shadow-md hover:shadow-lg transition-shadow",
    };

    const getCardStyle = () => {
        const baseStyle = cardStyles[design] || cardStyles.professional;
        if (design === 'modern') {
            return `${baseStyle} border-l-[${primaryColor}]`;
        }
        return baseStyle;
    };

    return (
        <Card className={getCardStyle()}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                                {service.title}
                            </h3>
                            {service.is_featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                        </div>
                        
                        {service.short_description && (
                            <p className="text-gray-600 text-sm mb-3">
                                {service.short_description}
                            </p>
                        )}
                    </div>
                    
                    {service.formatted_price && (
                        <Badge 
                            className="shrink-0"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {service.formatted_price}
                        </Badge>
                    )}
                </div>

                {service.main_image_url && (
                    <div className="mb-4">
                        <img
                            src={service.main_image_url}
                            alt={service.title}
                            className="w-full h-48 object-cover rounded-md"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {service.description.length > 150 
                            ? `${service.description.substring(0, 150)}...` 
                            : service.description
                        }
                    </p>
                </div>

                {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {service.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {service.images && service.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                        {service.images.filter(img => !img.is_main).slice(0, 3).map((image) => (
                            <img
                                key={image.id}
                                src={image.thumbnail_url}
                                alt={image.alt_text || service.title}
                                className="w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                            />
                        ))}
                        {service.images.length > 4 && (
                            <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                +{service.images.length - 4}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}