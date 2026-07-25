// Database Operations & Real-time Hooks
// CRUD untuk subscribers dan vouchers menggunakan Firebase Realtime Database

import { db } from "./firebase";
import {
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  get,
  query,
  orderByChild,
} from "firebase/database";
import { useState, useEffect } from "react";

// ============================================
// TYPES
// ============================================

export interface Subscriber {
  id: string;
  nama: string;
  email: string;
  whatsapp: string;
  paket: "super_power" | "invitation";
  durasi: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: "active" | "expired" | "cancelled";
  notes: string;
  createdAt: number; // timestamp
}

export interface Voucher {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: number;
  expiredAt: string | null; // ISO date string or null
}

// ============================================
// SUBSCRIBERS
// ============================================

export async function addSubscriber(
  data: Omit<Subscriber, "id" | "createdAt">
): Promise<string> {
  const subscribersRef = ref(db, "subscribers");
  const newRef = push(subscribersRef);
  await set(newRef, {
    ...data,
    createdAt: Date.now(),
  });
  return newRef.key!;
}

export async function updateSubscriber(
  id: string,
  data: Partial<Omit<Subscriber, "id">>
): Promise<void> {
  const subscriberRef = ref(db, `subscribers/${id}`);
  await update(subscriberRef, data);
}

export async function deleteSubscriber(id: string): Promise<void> {
  const subscriberRef = ref(db, `subscribers/${id}`);
  await remove(subscriberRef);
}

export async function checkAndExpireSubscribers(): Promise<void> {
  const subscribersRef = ref(db, "subscribers");
  const snapshot = await get(
    query(subscribersRef, orderByChild("status"))
  );

  if (!snapshot.exists()) return;

  const today = new Date().toISOString().split("T")[0];
  const updates: Record<string, unknown> = {};

  snapshot.forEach((child) => {
    const sub = child.val();
    if (sub.status === "active" && sub.endDate < today) {
      updates[`subscribers/${child.key}/status`] = "expired";
    }
  });

  if (Object.keys(updates).length > 0) {
    const rootRef = ref(db);
    await update(rootRef, updates);
  }
}

// ============================================
// VOUCHERS
// ============================================

export async function addVoucher(data: Voucher): Promise<void> {
  const voucherRef = ref(db, `vouchers/${data.code}`);
  await set(voucherRef, {
    ...data,
    createdAt: Date.now(),
  });
}

export async function updateVoucher(
  code: string,
  data: Partial<Voucher>
): Promise<void> {
  const voucherRef = ref(db, `vouchers/${code}`);
  await update(voucherRef, data);
}

export async function deleteVoucher(code: string): Promise<void> {
  const voucherRef = ref(db, `vouchers/${code}`);
  await remove(voucherRef);
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher: Voucher | null;
  message: string;
}

export async function validateVoucher(
  code: string
): Promise<VoucherValidationResult> {
  if (!code || code.trim() === "") {
    return { valid: false, voucher: null, message: "" };
  }

  const voucherRef = ref(db, `vouchers/${code.toUpperCase()}`);
  const snapshot = await get(voucherRef);

  if (!snapshot.exists()) {
    return {
      valid: false,
      voucher: null,
      message: "Kode voucher tidak ditemukan",
    };
  }

  const voucher = snapshot.val() as Voucher;

  if (!voucher.isActive) {
    return {
      valid: false,
      voucher: null,
      message: "Voucher sudah tidak aktif",
    };
  }

  if (voucher.currentUses >= voucher.maxUses) {
    return {
      valid: false,
      voucher: null,
      message: "Kuota voucher sudah habis",
    };
  }

  if (voucher.expiredAt) {
    const today = new Date().toISOString().split("T")[0];
    if (voucher.expiredAt < today) {
      return {
        valid: false,
        voucher: null,
        message: "Voucher sudah kadaluarsa",
      };
    }
  }

  return {
    valid: true,
    voucher,
    message:
      voucher.type === "percentage"
        ? `Diskon ${voucher.value}%`
        : `Potongan Rp${voucher.value.toLocaleString("id-ID")}`,
  };
}

export async function useVoucherOnce(code: string): Promise<void> {
  const voucherRef = ref(db, `vouchers/${code}`);
  const snapshot = await get(voucherRef);
  if (snapshot.exists()) {
    const current = snapshot.val().currentUses || 0;
    await update(voucherRef, { currentUses: current + 1 });
  }
}

// ============================================
// REAL-TIME HOOKS
// ============================================

export function useSubscribers(): {
  subscribers: Subscriber[];
  loading: boolean;
} {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscribersRef = ref(db, "subscribers");
    const unsubscribe = onValue(subscribersRef, (snapshot) => {
      const data: Subscriber[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({
            id: child.key!,
            ...child.val(),
          });
        });
      }
      // Sort by createdAt descending (newest first)
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setSubscribers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { subscribers, loading };
}

export function useVouchers(): {
  vouchers: Voucher[];
  loading: boolean;
} {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vouchersRef = ref(db, "vouchers");
    const unsubscribe = onValue(vouchersRef, (snapshot) => {
      const data: Voucher[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          data.push({
            ...child.val(),
            code: child.key!,
          });
        });
      }
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVouchers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { vouchers, loading };
}

// ============================================
// STATISTICS
// ============================================

export function getSubscriberStats(subscribers: Subscriber[]) {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const active = subscribers.filter((s) => s.status === "active");
  const expiringSoon = active.filter(
    (s) => s.endDate >= today && s.endDate <= sevenDaysLater
  );
  const expired = subscribers.filter((s) => s.status === "expired");

  return {
    total: subscribers.length,
    active: active.length,
    expiringSoon: expiringSoon.length,
    expired: expired.length,
  };
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusBadge(
  status: string,
  endDate: string
): { label: string; color: string; bgColor: string } {
  if (status === "cancelled") {
    return {
      label: "Dibatalkan",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    };
  }

  if (status === "expired") {
    return {
      label: "Expired",
      color: "text-red-700",
      bgColor: "bg-red-50",
    };
  }

  const daysLeft = getDaysRemaining(endDate);
  if (daysLeft <= 0) {
    return {
      label: "Expired",
      color: "text-red-700",
      bgColor: "bg-red-50",
    };
  }

  if (daysLeft <= 7) {
    return {
      label: `${daysLeft} hari lagi`,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
    };
  }

  return {
    label: "Active",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  };
}
