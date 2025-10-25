"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { api, CartOut, CartItemOut, ProductOut, PurchaseOut } from "../../lib/api";

export default function PosPage() {
  const [cart, setCart] = useState<CartOut | null>(null);
  const [jan, setJan] = useState("");
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [selectedJan, setSelectedJan] = useState("");
  const [lookup, setLookup] = useState<ProductOut | null>(null);
  const [janError, setJanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

  useEffect(() => {
    api.getCart().then(setCart).catch(console.error);
    // 初回に商品一覧を取得
    api.listProducts().then(setProducts).catch(console.error);
  }, []);

  const addJan = async (code: string, qty = 1) => {
    try {
      const normalized = (code || "").replace(/\D/g, "");
      if (normalized.length !== 13) {
        alert("JANコードは13桁の数字で入力してください");
        return;
      }
      const updated = await api.addCartItem(normalized, qty);
      setCart(updated);
      setJan("");
      setLookup(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`商品追加に失敗しました: ${msg}`);
    }
  };

  const lookupProduct = async () => {
    setJanError(null);
    setLookup(null);
    const normalized = (jan || "").replace(/\D/g, "");
    if (normalized.length !== 13) {
      setJanError("JANコードは13桁の数字で入力してください");
      return;
    }
    try {
      const p = await api.getProductByJan(normalized);
      setLookup(p);
    } catch (e) {
      setJanError("該当する商品が見つかりませんでした");
    }
  };

  const removeItem = async (item: CartItemOut) => {
    const updated = await api.removeCartItem(item.id);
    setCart(updated);
  };

  // ドロップダウンは常時表示するためトグル不要

  const startScan = () => {
    // まずスキャン状態にして、video要素がマウントされた後に起動する（下のuseEffectで起動）
    setScanning(true);
  };

  const stopScan = () => {
    setScanning(false);
    try {
      codeReader.reset();
    } catch {}
  };

  // スキャン開始の実体（video要素のrefが確実に存在してから起動）
  useEffect(() => {
    if (!scanning) return;
    const node = videoRef.current;
    if (!node) return;
    let cancelled = false;
    (async () => {
      try {
        await codeReader.decodeFromVideoDevice(
          undefined,
          node,
          (result) => {
            if (!result || cancelled) return;
            const text = result.getText();
            addJan(text);
            stopScan();
          }
        );
      } catch (e) {
        console.error(e);
        alert(
          "カメラの起動に失敗しました。ブラウザのカメラ許可設定とHTTPS(またはlocalhost)でのアクセスをご確認ください。"
        );
        setScanning(false);
      }
    })();
    return () => {
      cancelled = true;
      try { codeReader.reset(); } catch {}
    };
  }, [scanning]);

  return (
    <div className="app-page">
      <div className="phone">
        <div className="grid pos-root" style={{ gap: 12 }}>
          <h1>モバイルPOS</h1>

          <div className="card grid" style={{ gap: 8 }}>
            <div className="grid">
              <button onClick={scanning ? stopScan : startScan}>
                {scanning ? "スキャン停止" : "カメラでスキャン"}
              </button>
            </div>
            <div className="row">
              <input
                placeholder="JANコードを入力"
                value={jan}
                onChange={(e) => setJan(e.target.value)}
              />
              <button className="action-btn" onClick={lookupProduct} disabled={!jan}>
                確認
              </button>
            </div>
            {janError && <div style={{ color: "crimson" }}>{janError}</div>}
            {lookup && (
              <div
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div>{lookup.name}</div>
                  <div className="muted">JAN: {lookup.janCode} / ¥{lookup.priceInclTax}</div>
                </div>
                <button
                  onClick={() => {
                    const input = prompt("個数を入力", "1");
                    if (input == null) return;
                    const qty = Number(input);
                    if (!Number.isInteger(qty) || qty <= 0) {
                      alert("1以上の整数を入力してください");
                      return;
                    }
                    addJan(lookup.janCode, qty);
                  }}
                >
                  追加
                </button>
              </div>
            )}

            <div className="card grid" style={{ gap: 8 }}>
              <div className="muted">商品一覧から選択</div>
              <div className="row" style={{ gap: 8 }}>
                <select value={selectedJan} onChange={(e) => setSelectedJan(e.target.value)} style={{ flex: 1 }}>
                  <option value="">商品を選択してください</option>
                  {products.map((p) => (
                    <option key={p.janCode} value={p.janCode}>
                      {p.name} / JAN: {p.janCode} / ¥{p.priceInclTax}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!selectedJan) return;
                    const input = prompt("個数を入力", "1");
                    if (input == null) return;
                    const qty = Number(input);
                    if (!Number.isInteger(qty) || qty <= 0) {
                      alert("1以上の整数を入力してください");
                      return;
                    }
                    addJan(selectedJan, qty);
                    setSelectedJan("");
                  }}
                  disabled={!selectedJan}
                >
                  追加
                </button>
              </div>
            </div>

            <div className="card" style={{ display: scanning ? 'block' : 'none' }}>
              <div className="muted" style={{ marginBottom: 6 }}>
                スキャン中（カメラへのアクセス許可が必要です）
              </div>
              <video ref={videoRef} style={{ width: "100%", maxHeight: 300 }} />
            </div>
          </div>

          <div className="card" style={{ paddingBottom: 8 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2>カート</h2>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 400, color: "#111", whiteSpace: "nowrap" }}>
                  合計金額: ¥{cart?.totalInclTax ?? 0}
                </div>
                <div style={{ fontSize: 14, fontWeight: 400, color: "#111", whiteSpace: "nowrap" }}>
                  内消費税10%: ¥{cart ? cart.totalInclTax - cart.totalExclTax : 0}
                </div>
              </div>
            </div>
            <div className="grid">
              {cart?.items.map((it) => (
                <div key={it.id} className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div>{it.name}</div>
                    <div className="muted">{it.janCode} / ¥{it.priceInclTax} × {it.quantity}</div>
                  </div>
                  <div className="row">
                    <div>小計 ¥{it.subTotalInclTax}</div>
                    <button className="btn-sm" onClick={() => removeItem(it)}>削除</button>
                  </div>
                </div>
              ))}
              {cart?.items.length === 0 && <div className="muted">カートは空です</div>}
            </div>
          </div>

          <div className="actions-sticky" style={{ justifyItems: "stretch" }}>
            {/* 合計金額と内税の表示（購入直前に固定表示） */}
            <div className="card" style={{ padding: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="muted">うち税額（10%）</div>
                <div style={{ fontWeight: 600 }}>¥{cart ? cart.totalInclTax - cart.totalExclTax : 0}</div>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="muted">合計（税込）</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>¥{cart?.totalInclTax ?? 0}</div>
              </div>
            </div>

            <button
              style={{
                fontSize: 18,
                fontWeight: 700,
                padding: "14px 24px",
                borderRadius: 10,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                width: "100%",
              }}
              onClick={async () => {
                if (!cart || cart.items.length === 0) {
                  alert("カートが空です");
                  return;
                }
                const lines = cart.items.map((i) => `${i.name} / ${i.janCode} × ${i.quantity} = ¥${i.subTotalInclTax}`);
                const tax = cart.totalInclTax - cart.totalExclTax;
                const ok = confirm(`以下で購入しますか？\n\n${lines.join("\n")}\n\n合計金額: ¥${cart.totalInclTax}\n内消費税10%: ¥${tax}`);
                if (!ok) return;
                try {
                  const result: PurchaseOut = await api.createPurchase();
                  alert(`購入が完了しました。注文ID: ${result.id}`);
                  const c = await api.getCart();
                  setCart(c);
                } catch (e: any) {
                  alert(`購入に失敗しました: ${e.message || e}`);
                }
              }}
              disabled={!cart || cart.items.length === 0}
            >
              購入
            </button>
            <button
              style={{
                marginTop: 8,
                fontSize: 14,
                fontWeight: 600,
                padding: "10px 16px",
                borderRadius: 10,
                background: "#e5e7eb",
                color: "#111",
                border: "1px solid #d1d5db",
                width: "100%",
              }}
              onClick={async () => {
                if (!cart || cart.items.length === 0) {
                  alert("すでにカートは空です");
                  return;
                }
                const ok = confirm("カートを空にします。よろしいですか？");
                if (!ok) return;
                const cleared = await api.clearCart();
                setCart(cleared);
              }}
              disabled={!cart || cart.items.length === 0}
            >
              カートを空にする
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


