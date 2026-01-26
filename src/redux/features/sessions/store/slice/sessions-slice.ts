/**
 * Sessions Feature - Redux Slice
 * Manages user session state
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  UserSessionResponse,
  AdminSessionResponse,
  PaginatedSessionsResponse,
} from "@/redux/features/auth/store/models/response/session-response";
import {
  getAllSessionsService,
  getSessionByIdService,
  logoutSessionService,
  logoutOtherSessionsService,
  logoutAllSessionsService,
  adminGetSessionsService,
  adminGetSessionByIdService,
} from "@/redux/features/auth/store/thunks/session-thunks";

/**
 * Sessions state interface
 */
interface SessionsState {
  // User sessions
  sessions: UserSessionResponse[];
  currentSession: UserSessionResponse | null;
  selectedSession: UserSessionResponse | null;

  // Admin sessions
  adminSessions: PaginatedSessionsResponse | null;
  adminSelectedSession: AdminSessionResponse | null;

  // Loading states
  isLoading: boolean;
  isSessionDetailLoading: boolean;
  isAdminLoading: boolean;

  // Error state
  error: string | null;
}

/**
 * Initial sessions state
 */
const initialState: SessionsState = {
  sessions: [],
  currentSession: null,
  selectedSession: null,
  adminSessions: null,
  adminSelectedSession: null,
  isLoading: false,
  isSessionDetailLoading: false,
  isAdminLoading: false,
  error: null,
};

/**
 * Sessions slice
 */
const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    /**
     * Clear selected session
     */
    clearSelectedSession: (state) => {
      state.selectedSession = null;
    },

    /**
     * Clear admin selected session
     */
    clearAdminSelectedSession: (state) => {
      state.adminSelectedSession = null;
    },

    /**
     * Clear error
     */
    clearSessionError: (state) => {
      state.error = null;
    },

    /**
     * Set selected session
     */
    setSelectedSession: (state, action: PayloadAction<UserSessionResponse>) => {
      state.selectedSession = action.payload;
    },

    /**
     * Reset sessions state
     */
    resetSessionsState: () => initialState,
  },

  extraReducers: (builder) => {
    // Get all sessions handlers
    builder
      .addCase(getAllSessionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllSessionsService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
        // Find current session
        state.currentSession =
          action.payload.find((s) => s.isCurrentSession) || null;
      })
      .addCase(getAllSessionsService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get session by ID handlers
    builder
      .addCase(getSessionByIdService.pending, (state) => {
        state.isSessionDetailLoading = true;
        state.error = null;
      })
      .addCase(getSessionByIdService.fulfilled, (state, action) => {
        state.isSessionDetailLoading = false;
        state.selectedSession = action.payload;
      })
      .addCase(getSessionByIdService.rejected, (state, action) => {
        state.isSessionDetailLoading = false;
        state.error = action.payload as string;
      });

    // Logout specific session handlers
    builder
      .addCase(logoutSessionService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutSessionService.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the session from list
        const sessionId = action.meta.arg;
        state.sessions = state.sessions.filter((s) => s.id !== sessionId);
        if (state.selectedSession?.id === sessionId) {
          state.selectedSession = null;
        }
      })
      .addCase(logoutSessionService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout other sessions handlers
    builder
      .addCase(logoutOtherSessionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutOtherSessionsService.fulfilled, (state) => {
        state.isLoading = false;
        // Keep only current session
        state.sessions = state.sessions.filter((s) => s.isCurrentSession);
      })
      .addCase(logoutOtherSessionsService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout all sessions handlers
    builder
      .addCase(logoutAllSessionsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutAllSessionsService.fulfilled, (state) => {
        state.isLoading = false;
        state.sessions = [];
        state.currentSession = null;
      })
      .addCase(logoutAllSessionsService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Admin: Get all sessions handlers
    builder
      .addCase(adminGetSessionsService.pending, (state) => {
        state.isAdminLoading = true;
        state.error = null;
      })
      .addCase(adminGetSessionsService.fulfilled, (state, action) => {
        state.isAdminLoading = false;
        state.adminSessions = action.payload;
      })
      .addCase(adminGetSessionsService.rejected, (state, action) => {
        state.isAdminLoading = false;
        state.error = action.payload as string;
      });

    // Admin: Get session by ID handlers
    builder
      .addCase(adminGetSessionByIdService.pending, (state) => {
        state.isSessionDetailLoading = true;
        state.error = null;
      })
      .addCase(adminGetSessionByIdService.fulfilled, (state, action) => {
        state.isSessionDetailLoading = false;
        state.adminSelectedSession = action.payload;
      })
      .addCase(adminGetSessionByIdService.rejected, (state, action) => {
        state.isSessionDetailLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSelectedSession,
  clearAdminSelectedSession,
  clearSessionError,
  setSelectedSession,
  resetSessionsState,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
