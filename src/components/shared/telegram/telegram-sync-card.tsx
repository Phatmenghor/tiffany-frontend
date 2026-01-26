"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Link2, Unlink, Check } from "lucide-react";
import { TelegramIcon, TelegramLoginButton } from "./telegram-login-widget";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";
import { SocialSyncResponse } from "@/redux/features/auth/store/models/response/social-auth-response";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  syncTelegramAccountService,
  unsyncSocialAccountService,
} from "@/redux/features/auth/store/thunks/social-auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { SocialAuthConfig } from "@/constants/app-resource/default/default";
import { formatDistanceToNow } from "date-fns";

interface TelegramSyncCardProps {
  socialSync?: SocialSyncResponse | null;
  userType?: string;
  onSyncSuccess?: (response: SocialSyncResponse) => void;
  onUnsyncSuccess?: (response: SocialSyncResponse) => void;
}

/**
 * Telegram Sync Card Component
 * Shows connection status and allows connect/disconnect Telegram account
 */
export function TelegramSyncCard({
  socialSync,
  userType = "CUSTOMER",
  onSyncSuccess,
  onUnsyncSuccess,
}: TelegramSyncCardProps) {
  const dispatch = useAppDispatch();
  const isSocialLoading = useAppSelector((state) => state.auth.isSocialLoading);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isTelegramConnected =
    socialSync?.telegramId !== null && socialSync?.telegramId !== undefined;

  // Handle Telegram sync
  const handleTelegramSync = async (telegramData: TelegramAuthData) => {
    setIsConnecting(true);
    try {
      const result = await dispatch(
        syncTelegramAccountService({
          telegramData,
          userType,
        })
      ).unwrap();

      showToast.success("Telegram account connected successfully!");
      onSyncSuccess?.(result);
    } catch (err: any) {
      showToast.error(err || "Failed to connect Telegram account.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Telegram unsync
  const handleTelegramUnsync = async () => {
    try {
      const result = await dispatch(unsyncSocialAccountService("TELEGRAM")).unwrap();
      showToast.success("Telegram account disconnected successfully.");
      onUnsyncSuccess?.(result);
    } catch (err: any) {
      showToast.error(err || "Failed to disconnect Telegram account.");
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Telegram Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isTelegramConnected ? "bg-[#0088cc]" : "bg-gray-200"
                }`}
              >
                <TelegramIcon
                  className={`h-6 w-6 ${
                    isTelegramConnected ? "text-white" : "text-gray-500"
                  }`}
                />
              </div>

              {/* Connection Info */}
              <div>
                <h3 className="font-semibold text-foreground">Telegram</h3>
                {isTelegramConnected ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Connected as @{socialSync?.telegramUsername}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your Telegram account for quick login
                  </p>
                )}
                {socialSync?.syncedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Synced{" "}
                    {formatDistanceToNow(new Date(socialSync.syncedAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            {isTelegramConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={isSocialLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isSocialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Disconnect
              </Button>
            ) : (
              <TelegramLoginButton
                botName={SocialAuthConfig.TELEGRAM_BOT_NAME}
                botId={SocialAuthConfig.TELEGRAM_BOT_ID}
                onAuth={handleTelegramSync}
                disabled={isSocialLoading}
                loading={isConnecting}
                className="h-9 text-sm"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </TelegramLoginButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Telegram Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your Telegram account (@
              {socialSync?.telegramUsername})? You will no longer be able to use
              Telegram to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isSocialLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTelegramUnsync}
              disabled={isSocialLoading}
            >
              {isSocialLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
