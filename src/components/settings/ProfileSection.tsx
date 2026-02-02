import { User, Mail, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types/settings";
import { format } from "date-fns";

interface ProfileSectionProps {
  profile: UserProfile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span className="text-sm">Name</span>
            </div>
            <span className="font-medium">{profile.name}</span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Email</span>
            </div>
            <span className="font-medium">{profile.email}</span>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Timezone</span>
            </div>
            <span className="font-medium">{profile.timezone}</span>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Member since</span>
            </div>
            <span className="font-medium">
              {format(new Date(profile.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 pt-3 border-t">
          Profile information is managed through your account provider.
        </p>
      </CardContent>
    </Card>
  );
}
