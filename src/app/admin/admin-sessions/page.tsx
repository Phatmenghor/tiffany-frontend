"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { adminGetSessionsService } from "@/redux/features/auth/store/thunks/session-thunks";
import {
  AdminSessionResponse,
} from "@/redux/features/auth/store/models/response/session-response";
import {
  SessionFilterRequest,
  DeviceType,
  SessionStatus,
} from "@/redux/features/auth/store/models/request/session-request";
import { formatDistanceToNow, format } from "date-fns";
import Loading from "@/components/shared/common/loading";
import { AdminSessionDetailModal } from "@/components/shared/modal/admin-session-detail-modal";
import { AppDefault } from "@/constants/app-resource/default/default";

export default function AdminSessionsPage() {
  const dispatch = useAppDispatch();

  const { adminSessions, isAdminLoading, error } = useAppSelector(
    (state) => state.sessions
  );

  const [selectedSession, setSelectedSession] =
    useState<AdminSessionResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<SessionFilterRequest>({
    search: "",
    pageNo: 1,
    pageSize: AppDefault.PAGE_SIZE,
    sortBy: "loginAt",
    sortDirection: "DESC",
    userId: null,
    statuses: [],
    deviceTypes: [],
  });

  // Debounced search
  const [searchValue, setSearchValue] = useState("");

  // Load sessions
  const loadSessions = useCallback(() => {
    dispatch(adminGetSessionsService(filters));
  }, [dispatch, filters]);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue, pageNo: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Get device icon
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case "MOBILE":
        return <Smartphone className="h-4 w-4" />;
      case "TABLET":
        return <Tablet className="h-4 w-4" />;
      case "DESKTOP":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: SessionStatus) => {
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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, pageNo: newPage }));
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    if (status === "ALL") {
      setFilters((prev) => ({ ...prev, statuses: [], pageNo: 1 }));
    } else {
      setFilters((prev) => ({
        ...prev,
        statuses: [status as SessionStatus],
        pageNo: 1,
      }));
    }
  };

  // Handle device type filter change
  const handleDeviceTypeFilter = (deviceType: string) => {
    if (deviceType === "ALL") {
      setFilters((prev) => ({ ...prev, deviceTypes: [], pageNo: 1 }));
    } else {
      setFilters((prev) => ({
        ...prev,
        deviceTypes: [deviceType as DeviceType],
        pageNo: 1,
      }));
    }
  };

  // View session details
  const handleViewSession = (session: AdminSessionResponse) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  };

  // Pagination info
  const totalPages = adminSessions?.totalPages || 1;
  const currentPage = adminSessions?.pageNo || 1;
  const totalElements = adminSessions?.totalElements || 0;

  if (isAdminLoading && !adminSessions) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Session Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all user sessions across the platform
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSessions}
            disabled={isAdminLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isAdminLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username, device, or IP..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filters.statuses?.[0] || "ALL"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="LOGGED_OUT">Logged Out</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>

              {/* Device Type Filter */}
              <Select
                value={filters.deviceTypes?.[0] || "ALL"}
                onValueChange={handleDeviceTypeFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Devices</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                  <SelectItem value="DESKTOP">Desktop</SelectItem>
                  <SelectItem value="TABLET">Tablet</SelectItem>
                  <SelectItem value="WEB">Web</SelectItem>
                </SelectContent>
              </Select>

              {/* Page Size */}
              <Select
                value={filters.pageSize.toString()}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    pageSize: parseInt(value),
                    pageNo: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent>
                  {AppDefault.PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Sessions Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminSessions?.content.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewSession(session)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {session.userFullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.userIdentifier}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.deviceType)}
                        <div>
                          <p className="text-sm">{session.deviceDisplayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.browser}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {session.city}, {session.country}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.ipAddress}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {format(new Date(session.loginAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.loginAt), "h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(session.lastActiveAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSession(session);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {adminSessions?.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No sessions found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {adminSessions && adminSessions.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * filters.pageSize + 1} to{" "}
              {Math.min(currentPage * filters.pageSize, totalElements)} of{" "}
              {totalElements} sessions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isAdminLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isAdminLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Session Detail Modal */}
      <AdminSessionDetailModal
        session={selectedSession}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSession(null);
        }}
      />
    </div>
  );
}
