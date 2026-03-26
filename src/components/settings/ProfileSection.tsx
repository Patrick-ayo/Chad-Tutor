import { User, Mail, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types/settings";
import { format } from "date-fns";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface ProfileSectionProps {
  profile: UserProfile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const resolvedName = user?.fullName || profile.name;
  const resolvedEmail = user?.primaryEmailAddress?.emailAddress || profile.email;
  const resolvedTimezone = profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const resolvedCreatedAt = user?.createdAt ?? new Date(profile.createdAt);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

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
            <span className="font-medium">{resolvedName}</span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Email</span>
            </div>
            <span className="font-medium">{resolvedEmail}</span>
          </div>

          {/* User ID */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span className="text-sm">User ID</span>
            </div>
            <span className="font-medium text-xs">{user?.id || profile.id}</span>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Timezone</span>
            </div>
            <span className="font-medium">{resolvedTimezone}</span>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Member since</span>
            </div>
            <span className="font-medium">
              {format(new Date(resolvedCreatedAt), "MMMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 pt-3 border-t">
          Profile information is managed through your account provider.
        </p>
      </CardContent>
    </Card>
  );
}
