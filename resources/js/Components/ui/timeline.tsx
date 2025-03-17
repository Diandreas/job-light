import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> { }

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("space-y-4", className)} {...props}>
                {children}
            </div>
        );
    }
);
Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> { }

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("relative pl-8", className)} {...props}>
                {children}
            </div>
        );
    }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> { }

const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border bg-white",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
TimelineIcon.displayName = "TimelineIcon";

interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> { }

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute left-4 top-8 h-full w-px -translate-x-1/2 bg-gray-200",
                    className
                )}
                {...props}
            />
        );
    }
);
TimelineConnector.displayName = "TimelineConnector";

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("pt-1", className)} {...props}>
                {children}
            </div>
        );
    }
);
TimelineContent.displayName = "TimelineContent";

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("mb-2", className)} {...props}>
                {children}
            </div>
        );
    }
);
TimelineHeader.displayName = "TimelineHeader";

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

const TimelineTitle = React.forwardRef<HTMLHeadingElement, TimelineTitleProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn("font-medium leading-none", className)}
                {...props}
            >
                {children}
            </h3>
        );
    }
);
TimelineTitle.displayName = "TimelineTitle";

export {
    Timeline,
    TimelineItem,
    TimelineIcon,
    TimelineConnector,
    TimelineContent,
    TimelineHeader,
    TimelineTitle,
};