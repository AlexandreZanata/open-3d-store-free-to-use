import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { storeMeQueryKey } from "@/auth/storeAuthKeys";
import { useStoreAuth } from "@/auth/useStoreAuth";
import { updateStoreProfile } from "@/lib/api/store-auth";
import {
  readGuestCheckoutName,
  readGuestCheckoutNote,
  writeGuestCheckoutName,
  writeGuestCheckoutNote,
} from "@/lib/checkoutPreferences";

const NOTE_SYNC_DELAY_MS = 600;

export function useCheckoutForm() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user, checkoutNote, isLoading } = useStoreAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated && user) {
      setCustomerName(user.displayName);
      setCustomerNote(checkoutNote ?? "");
      return;
    }
    setCustomerName(readGuestCheckoutName());
    setCustomerNote(readGuestCheckoutNote());
  }, [checkoutNote, isAuthenticated, isLoading, user]);

  const onNameChange = useCallback(
    (value: string) => {
      setCustomerName(value);
      setNameError(null);
      if (!isAuthenticated) {
        writeGuestCheckoutName(value);
      }
    },
    [isAuthenticated],
  );

  const scheduleNoteSync = useCallback(
    (value: string) => {
      if (!isAuthenticated) {
        writeGuestCheckoutNote(value);
        return;
      }
      if (noteTimerRef.current) {
        clearTimeout(noteTimerRef.current);
      }
      noteTimerRef.current = setTimeout(() => {
        void updateStoreProfile({ checkoutNote: value.trim() || null })
          .then((data) => {
            queryClient.setQueryData(storeMeQueryKey, data);
          })
          .catch(() => undefined);
      }, NOTE_SYNC_DELAY_MS);
    },
    [isAuthenticated, queryClient],
  );

  const onNoteChange = useCallback(
    (value: string) => {
      setCustomerNote(value);
      scheduleNoteSync(value);
    },
    [scheduleNoteSync],
  );

  const resolveCustomerName = useCallback((): string | null => {
    if (isAuthenticated && user) {
      return user.displayName.trim();
    }
    const trimmed = customerName.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  }, [customerName, isAuthenticated, user]);

  const validateBeforeOrder = useCallback((): boolean => {
    if (resolveCustomerName() !== null) {
      setNameError(null);
      return true;
    }
    setNameError("required");
    return false;
  }, [resolveCustomerName]);

  useEffect(() => {
    return () => {
      if (noteTimerRef.current) {
        clearTimeout(noteTimerRef.current);
      }
    };
  }, []);

  return {
    isAuthenticated,
    customerName,
    customerNote,
    nameError,
    nameReadOnly: isAuthenticated,
    onNameChange,
    onNoteChange,
    resolveCustomerName,
    validateBeforeOrder,
  };
}
