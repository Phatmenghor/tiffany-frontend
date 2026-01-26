"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Calendar,
  Timer,
  Wifi,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { UserSessionResponse } from "@/redux/features/auth/store/models/response/session-response";
import { DeviceType, SessionStatus } from "@/redux/features/auth/store/models/request/session-request";
import { format, formatDistanceToNow } from "date-fns";

interface SessionDetailModalProps {
  session: UserSessionResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: (session: UserSessionResponse) => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onLogout,
}: SessionDetailModalProps) {
  if (!session) return null;

  // Get device icon based on device type
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case "MOBILE":
        return <Smartphone className="h-6 w-6" />;
      case "TABLET":
        return <Tablet className="h-6 w-6" />;
      case "DESKTOP":
        return <Monitor className="h-6 w-6" />;
      default:
        return <Globe className="h-6 w-6" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: SessionStatus, isCurrentSession: boolean) => {
    if (isCurrentSession) {
      return (
        <Badge variant="default" className="bg-green-500">
          Current Session
        </Badge>
      );
    }

    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "LOGGED_OUT":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            <XCircle className="h-3 w-3 mr-1" />
            Logged Out
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) {
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days}d ${remainingHours}h`
      : `${days} days`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Device Header */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                session.isCurrentSession
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {getDeviceIcon(session.deviceType)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {session.deviceDisplayName || session.deviceName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(session.status, session.isCurrentSession)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Device Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Device Information
            </h4>

            <DetailRow
              icon={<Globe className="h-4 w-4" />}
              label="Browser"
              value={session.browser}
            />
            <DetailRow
              icon={<Monitor className="h-4 w-4" />}
              label="Operating System"
              value={session.operatingSystem}
            />
            <DetailRow
              icon={<Smartphone className="h-4 w-4" />}
              label="Device Type"
              value={session.deviceType}
            />
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Location
            </h4>

            <DetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={`${session.city}, ${session.country}`}
            />
            <DetailRow
              icon={<Wifi className="h-4 w-4" />}
              label="IP Address"
              value={session.ipAddress}
            />
          </div>

          <Separator />

          {/* Session Timing */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Session Timing
            </h4>

            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Login Time"
              value={format(new Date(session.loginAt), "MMM d, yyyy 'at' h:mm a")}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4" />}
              label="Last Active"
              value={formatDistanceToNow(new Date(session.lastActiveAt), {
                addSuffix: true,
              })}
            />
            <DetailRow
              icon={<Timer className="h-4 w-4" />}
              label="Session Duration"
              value={formatDuration(session.sessionDurationMinutes)}
            />
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Expires"
              value={format(new Date(session.expiresAt), "MMM d, yyyy 'at' h:mm a")}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!session.isCurrentSession && session.status === "ACTIVE" && onLogout && (
            <Button
              variant="destructive"
              onClick={() => onLogout(session)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout This Device
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for detail rows
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
