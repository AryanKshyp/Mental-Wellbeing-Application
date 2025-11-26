import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("w-full max-w-lg", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
}

