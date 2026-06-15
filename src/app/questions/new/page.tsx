"use client";

import { db } from "@/lib/db/schema";
import { Sprout, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewQuestion() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [memo, setMemo] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;
        setSaving(true);
        await db.questions.add({
            title: title.trim(),
            memo: memo.trim() || undefined,
            status: "sprout",
            created_at: new Date(),
            thought_count: 0,
        });
        router.push("/");
    };

    return (
        <div style={{ paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #C8BFA8", display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/">
                    <button style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                        <ArrowLeft size={18} strokeWidth={1.8} />
                    </button>
                </Link>
                <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060" }}>問いを植える</span>
            </div>

            <div style={{ padding: "28px 20px" }}>
                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 6px", letterSpacing: "0.05em" }}>
                    問い
                </p>
                <textarea
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="例：愛とは選択なのか感情なのか"
                    style={{
                        width: "100%", minHeight: 80,
                        border: "none", borderBottom: "1px solid #C8BFA8",
                        background: "transparent",
                        fontFamily: "var(--font-noto-serif-jp), serif",
                        fontSize: 17, color: "#1C1C1A",
                        resize: "none", outline: "none", lineHeight: 1.7,
                        padding: "6px 0",
                    }}
                />

                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "24px 0 6px", letterSpacing: "0.05em" }}>
                    メモ（任意）
                </p>
                <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    placeholder="この問いに出会ったきっかけなど"
                    style={{
                        width: "100%", minHeight: 80,
                        border: "none", borderBottom: "1px solid #C8BFA8",
                        background: "transparent",
                        fontFamily: "var(--font-noto-serif-jp), serif",
                        fontSize: 14, color: "#3D3B35",
                        resize: "none", outline: "none", lineHeight: 1.75,
                        padding: "6px 0",
                    }}
                />

                <button
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                    style={{
                        marginTop: 36, width: "100%", padding: "13px",
                        background: title.trim() ? "#4A6741" : "#C8BFA8",
                        border: "none", borderRadius: 6, color: "#fff",
                        fontFamily: "system-ui", fontSize: 14,
                        cursor: title.trim() ? "pointer" : "default",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                >
                    <Sprout size={16} strokeWidth={1.8} />
                    {saving ? "植えています..." : "庭に植える"}
                </button>
            </div>
        </div>
    );
}