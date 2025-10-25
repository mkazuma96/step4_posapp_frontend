"use client";
import React, { useState } from "react";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";

export default function Page() {
  const [clerkCode, setClerkCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const start = async () => {
    setError(null);
    if (!clerkCode) return;
    if (!["1", "2", "3", "4", "5"].includes(clerkCode)) {
      setError("担当者コードは1〜5のみ有効です");
      return;
    }
    try {
      await api.startSession(clerkCode, "30");
      router.push("/pos");
    } catch (e: any) {
      setError("セッション開始に失敗しました");
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1>担当者コードの入力</h1>
      <div className="card grid">
        <label className="grid">
          <span className="muted">担当者コード (1〜5)</span>
          <input value={clerkCode} onChange={(e) => setClerkCode(e.target.value)} maxLength={1} placeholder="1〜5" />
        </label>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        <button onClick={start} disabled={!clerkCode}>
          開始する → 商品登録へ
        </button>
      </div>
    </div>
  );
}


