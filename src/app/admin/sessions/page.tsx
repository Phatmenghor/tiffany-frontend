"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getAllSessionsService,
  logoutSessionService,
  logoutOtherSessionsService,
  logoutAllSessionsService,
} from "@/redux/features/auth/store/thunks/session-thunks";
import { UserSessionResponse } from "@/redux/features/auth/store/models/response/session-response";
import { DeviceType, SessionStatus } from "@/redux/features/auth/store/models/request/session-request";
import { showToast } from "@/components/shared/common/show-toast";
import { formatDistanceToNow, format } from "date-fns";
import Loading from "@/components/shared/common/loading";
import { clearAllTokens } from "@/utils/local-storage/token";
import { removeUserInfo } from "@/utils/local-storage/userInfo";
import { ROUTES } from "@/constants/app-routes/routes";
import { SessionDetailModal } from "@/components/shared/modal/session-detail-modal";

export default function SessionsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { sessions, currentSession, isLoading, error } = useAppSelector(
    (state) => state.sessions
  );

  const [selectedSession, setSelectedSession] =
    useState<UserSessionResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLogoutOthersDialogOpen, setIsLogoutOthersDialogOpen] =
    useState(false);
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] = useState(false);
  const [sessionToLogout, setSessionToLogout] =
    useState<UserSessionResponse | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    dispatch(getAllSessionsService());
  }, [dispatch]);

  // Get device icon based on device type
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case "MOBILE":
        return <Smartphone className="h-5 w-5" />;
      case "TABLET":
        return <Tablet className="h-5 w-5" />;
      case "DESKTOP":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  // Get status badge variant
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

  // Handle logout single session
  const handleLogoutSession = async () => {
    if (!sessionToLogout) return;

    setIsActionLoading(true);
    try {
      await dispatch(logoutSessionService(sessionToLogout.id)).unwrap();
      showToast.success("Session logged out successfully");
      setIsLogoutDialogOpen(false);
      setSessionToLogout(null);
    } catch (err: any) {
      showToast.error(err || "Failed to logout session");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle logout all other sessions
  const handleLogoutOthers = async () => {
    if (!currentSession) return;

    setIsActionLoading(true);
    try {
      await dispatch(logoutOtherSessionsService(currentSession.id)).unwrap();
      showToast.success("All other sessions logged out successfully");
      setIsLogoutOthersDialogOpen(false);
    } catch (err: any) {
      showToast.error(err || "Failed to logout other sessions");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle logout all sessions (including current)
  const handleLogoutAll = async () => {
    setIsActionLoading(true);
    try {
      await dispatch(logoutAllSessionsService()).unwrap();
      showToast.success("All sessions logged out");
      // Clear local tokens and redirect to login
      clearAllTokens();
      removeUserInfo();
      router.replace(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      showToast.error(err || "Failed to logout all sessions");
      // Still clear local state and redirect
      clearAllTokens();
      removeUserInfo();
      router.replace(ROUTES.AUTH.LOGIN);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open session detail
  const handleViewSession = (session: UserSessionResponse) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  };

  // Open logout confirmation
  const handleConfirmLogout = (session: UserSessionResponse) => {
    setSessionToLogout(session);
    setIsLogoutDialogOpen(true);
  };

  if (isLoading && sessions.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Active Sessions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your active sessions and sign out from other devices
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(getAllSessionsService())}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => setIsLogoutOthersDialogOpen(true)}
            disabled={sessions.filter((s) => !s.isCurrentSession).length === 0}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout Other Devices
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsLogoutAllDialogOpen(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Logout Everywhere
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                session.isCurrentSession ? "border-primary" : ""
              }`}
              onClick={() => handleViewSession(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Device Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        session.isCurrentSession
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getDeviceIcon(session.deviceType)}
                    </div>

                    {/* Session Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {session.deviceDisplayName || session.deviceName}
                        </h3>
                        {getStatusBadge(session.status, session.isCurrentSession)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.browser} · {session.operatingSystem}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.city}, {session.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active{" "}
                          {formatDistanceToNow(new Date(session.lastActiveAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span>IP: {session.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!session.isCurrentSession && session.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmLogout(session);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {sessions.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active sessions found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSession(null);
        }}
        onLogout={handleConfirmLogout}
      />

      {/* Logout Single Session Confirmation */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout This Session?</DialogTitle>
            <DialogDescription>
              This will end the session on{" "}
              {sessionToLogout?.deviceDisplayName || sessionToLogout?.deviceName}.
              The device will need to sign in again to access the account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutSession}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Other Sessions Confirmation */}
      <Dialog
        open={isLogoutOthersDialogOpen}
        onOpenChange={setIsLogoutOthersDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout All Other Devices?</DialogTitle>
            <DialogDescription>
              This will end all sessions except your current one. All other
              devices will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutOthersDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutOthers}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Logout Others
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout All Sessions Confirmation */}
      <Dialog
        open={isLogoutAllDialogOpen}
        onOpenChange={setIsLogoutAllDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Logout Everywhere?
            </DialogTitle>
            <DialogDescription>
              <strong>Warning:</strong> This will end ALL sessions including your
              current one. You will be redirected to the login page and all
              devices will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutAllDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutAll}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Logout Everywhere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
