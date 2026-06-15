"use client";

import { db } from "@/lib/db/schema";
import { Sprout, ArrowLeft, PenLine, Sparkles, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function QuestionPickInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const suggestionsParam = searchParams.get("suggestions") ?? "[]";
    const suggestions: string[] = JSON.parse(decodeURIComponent(suggestionsParam));

    const [selected, setSelected] = useState<string[]>([]);
    const [customTitle, setCustomTitle] = useState("");
    const [showCustom, setShowCustom] = useState(false);
    const [saving, setSaving] = useState(false);

    const toggleSelect = (q: string) => {
        setSelected(prev =>
            prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]
        );
    };

    const allToPlant = [
        ...selected,
        ...(customTitle.trim() ? [customTitle.trim()] : []),
    ];

    const handlePlant = async () => {
        if (allToPlant.length === 0 || saving) return;
        setSaving(true);
        const now = new Date();
        for (const title of allToPlant) {
            await db.questions.add({
                title,
                status: "sprout",
                created_at: now,
                thought_count: 0,
            });
        }
        router.push("/");
    };

    return (
        <div style={{ paddingBottom: 100 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #C8BFA8", display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/fieldnotes">
                    <button style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", padding: 4, display: "flex" }}>
                        <ArrowLeft size={18} strokeWidth={1.8} />
                    </button>
                </Link>
                <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060" }}>問いを選ぶ</span>
            </div>

            <div style={{ padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Sparkles size={14} color="#7A7060" strokeWidth={1.6} />
                    <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: 0, letterSpacing: "0.05em" }}>
                        AIが生成した問い候補
                    </p>
                </div>
                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 16px" }}>
                    複数選択できます
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {suggestions.map((q, i) => {
                        const isSelected = selected.includes(q);
                        return (
                            <button key={i} onClick={() => toggleSelect(q)} style={{
                                textAlign: "left", padding: "14px 16px",
                                border: `1px solid ${isSelected ? "#4A6741" : "#C8BFA8"}`,
                                borderRadius: 8,
                                background: isSelected ? "#EBF0E9" : "transparent",
                                fontFamily: "var(--font-noto-serif-jp), serif",
                                fontSize: 14, color: "#1C1C1A", lineHeight: 1.65,
                                cursor: "pointer",
                                display: "flex", alignItems: "flex-start", gap: 10,
                            }}>
                                <div style={{
                                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                                    border: `1.5px solid ${isSelected ? "#4A6741" : "#C8BFA8"}`,
                                    background: isSelected ? "#4A6741" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {isSelected && <Check size={11} color="#fff" strokeWidth={2.5} />}
                                </div>
                                <span>{q}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 自分で書く */}
                <button onClick={() => setShowCustom(v => !v)} style={{
                    width: "100%", padding: "11px",
                    border: `1px dashed ${showCustom ? "#4A6741" : "#C8BFA8"}`,
                    borderRadius: 8, background: showCustom ? "#EBF0E9" : "transparent",
                    color: showCustom ? "#4A6741" : "#7A7060",
                    fontFamily: "system-ui", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                    <PenLine size={13} /> ＋ 自分で問いを書く
                </button>

                {showCustom && (
                    <textarea
                        value={customTitle}
                        onChange={e => setCustomTitle(e.target.value)}
                        placeholder="例：孤独とは欠如なのか、それとも状態なのか"
                        autoFocus
                        style={{
                            marginTop: 10, width: "100%", minHeight: 80,
                            border: "1px solid #C8BFA8", borderRadius: 8,
                            background: "#F2EDE4",
                            fontFamily: "var(--font-noto-serif-jp), serif",
                            fontSize: 14, color: "#1C1C1A",
                            resize: "none", outline: "none", lineHeight: 1.75, padding: 12,
                        }}
                    />
                )}
            </div>

            {/* 植えるボタン（固定フッター） */}
            {allToPlant.length > 0 && (
                <div style={{
                    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
                    width: "100%", maxWidth: 480,
                    background: "#FAFAF7", borderTop: "1px solid #C8BFA8",
                    padding: "12px 20px 24px", zIndex: 100,
                }}>
                    <button
                        onClick={handlePlant}
                        disabled={saving}
                        style={{
                            width: "100%", padding: "13px",
                            background: "#4A6741", border: "none", borderRadius: 6, color: "#fff",
                            fontFamily: "system-ui", fontSize: 14, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                        <Sprout size={16} strokeWidth={1.8} />
                        {saving
                            ? "植えています..."
                            : `${allToPlant.length}つの問いを庭に植える`}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function QuestionPickPage() {
    return (
        <Suspense>
            <QuestionPickInner />
        </Suspense>
    );
}