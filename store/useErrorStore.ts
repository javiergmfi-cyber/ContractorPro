import { create } from "zustand";
import { ErrorType } from "@/components/ErrorRecoveryOverlay";

interface ErrorState {
  // State
  isVisible: boolean;
  errorType: ErrorType;
  errorMessage: string | null;
  retryCallback: (() => void) | null;

  // Actions
  showError: (
    type: ErrorType,
    message?: string,
    onRetry?: () => void
  ) => void;
  hideError: () => void;

  // Convenience methods for common errors
  showNetworkError: (onRetry?: () => void) => void;
  showPaymentError: (message?: string, onRetry?: () => void) => void;
  showAuthError: () => void;
  showSyncError: (onRetry?: () => void) => void;
  showVoiceError: (onRetry?: () => void) => void;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  // Initial state
  isVisible: false,
  errorType: "generic",
  errorMessage: null,
  retryCallback: null,

  // Show error with guided recovery
  showError: (type, message, onRetry) => {
    set({
      isVisible: true,
      errorType: type,
      errorMessage: message || null,
      retryCallback: onRetry || null,
    });
  },

  // Hide error overlay
  hideError: () => {
    set({
      isVisible: false,
      errorMessage: null,
      retryCallback: null,
    });
  },

  // Convenience: Network error
  showNetworkError: (onRetry) => {
    get().showError(
      "network",
      "Unable to connect to the server. Please check your internet connection.",
      onRetry
    );
  },

  // Convenience: Payment error
  showPaymentError: (message, onRetry) => {
    get().showError(
      "payment",
      message || "Your payment couldn't be processed. Please try again.",
      onRetry
    );
  },

  // Convenience: Auth error
  showAuthError: () => {
    get().showError(
      "auth",
      "Your session has expired. Please sign in again to continue."
    );
  },

  // Convenience: Sync error
  showSyncError: (onRetry) => {
    get().showError(
      "sync",
      "Some changes couldn't be synced. They're saved locally and will sync when possible.",
      onRetry
    );
  },

  // Convenience: Voice processing error
  showVoiceError: (onRetry) => {
    get().showError(
      "voice",
      "We couldn't understand that recording. Try speaking more clearly or use manual entry.",
      onRetry
    );
  },
}));
