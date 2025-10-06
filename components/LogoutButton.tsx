"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await logout();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="primary"
      disabled={pending}
    >
      {pending ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </button>
  );
}
