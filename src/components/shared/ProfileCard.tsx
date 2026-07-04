"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { StudentWithUser } from "@/types";

interface ProfileCardProps {
  student: StudentWithUser;
  href: string;
}

export function ProfileCard({ student, href }: ProfileCardProps) {
  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={href}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-brand/10 text-brand font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {student.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                RCA Class of {student.cohortYear}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {student.bio || "No bio yet"}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {student.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {student.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{student.skills.length - 4}
              </Badge>
            )}
          </div>
          {student.availability.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {student.availability.map((a) => (
                <Badge key={a} variant="outline" className="text-xs capitalize">
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
