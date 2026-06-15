"use client";

import { db } from "@/lib/db/schema";
import { ArrowLeft, Sparkles, PenLine, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function toDateInputValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function NewFieldNoteInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultDate = searchParams.get("date") ?? toDateInputValue(new Date());

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [recordDate, setRecordDate] = useState(defaultDate);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveNote = async () => {
        const [y, m, d] = recordDate.split("-").map(Number);
        const created_at = new Date(y, m - 1, d, 12, 0, 0);
        await db.fieldnotes.add({
            title: title.trim() || undefined,
            body: body.trim(),
            created_at,
        });
    };

    const handleSave = async () => {
        if (!body.trim() || saving) return;
        setSaving(true);
        await saveNote();
        router.push("/fieldnotes");
    };

    const handleSaveAndGenerate = async () => {
        if (!body.trim() || generating) return;
        setGenerating(true);
        setError(null);
        await saveNote();

        try {
            const res = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: body }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            const encoded = encodeURIComponent(JSON.stringify(data.questions));
            router.push(`/questions/pick?suggestions=${encoded}`);
        } catch (e) {
            setError("問いの生成に失敗しました。もう一度試してください。");
            setGenerating(false);
        }
    };

    return (
        <div style={{ paddingBottom: 80 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #C8BFA8", display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/fieldnotes">
                    <button style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", padding: 4, display: "flex" }}>
                        <ArrowLeft size={18} strokeWidth={1.8} />
                    </button>
                </Link>
                <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060" }}>日記を書く</span>
            </div>

            <div style={{ padding: "24px 20px" }}>
                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 6px", letterSpacing: "0.05em" }}>記録日</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, borderBottom: "1px solid #C8BFA8", paddingBottom: 8 }}>
                    <Calendar size={14} color="#7A7060" strokeWidth={1.6} />
                    <input
                        type="date"
                        value={recordDate}
                        onChange={e => setRecordDate(e.target.value)}
                        style={{
                            border: "none", background: "transparent",
                            fontFamily: "system-ui", fontSize: 14, color: "#1C1C1A",
                            outline: "none", cursor: "pointer",
                        }}
                    />
                </div>

                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 6px", letterSpacing: "0.05em" }}>タイトル（任意）</p>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="例：カフェの観察"
                    style={{
                        width: "100%", border: "none", borderBottom: "1px solid #C8BFA8",
                        background: "transparent", fontFamily: "system-ui", fontSize: 14, color: "#1C1C1A",
                        outline: "none", padding: "6px 0", marginBottom: 20,
                    }}
                />

                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 6px", letterSpacing: "0.05em" }}>今日気づいたこと</p>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="カフェで全員がイヤホンをしていた..."
                    style={{
                        width: "100%", minHeight: 200,
                        border: "1px solid #C8BFA8", borderRadius: 6,
                        background: "#F2EDE4",
                        fontFamily: "var(--font-noto-serif-jp), serif",
                        fontSize: 14, color: "#1C1C1A",
                        resize: "vertical", outline: "none", lineHeight: 1.8,
                        padding: 12,
                    }}
                />

                {error && (
                    <p style={{ fontFamily: "system-ui", fontSize: 12, color: "#C8493A", margin: "10px 0 0" }}>
                        {error}
                    </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                    <button
                        onClick={handleSaveAndGenerate}
                        disabled={!body.trim() || generating || saving}
                        style={{
                            width: "100%", padding: "12px",
                            background: body.trim() ? "#4A6741" : "#C8BFA8",
                            border: "none", borderRadius: 6, color: "#fff",
                            fontFamily: "system-ui", fontSize: 13,
                            cursor: body.trim() ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                        <Sparkles size={14} />
                        {generating ? "問いを考えています..." : "AIに問い候補を生成してもらう"}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!body.trim() || saving || generating}
                        style={{
                            width: "100%", padding: "12px",
                            background: "transparent",
                            border: "1px solid #C8BFA8", borderRadius: 6,
                            color: "#7A7060", fontFamily: "system-ui", fontSize: 13,
                            cursor: body.trim() ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                        <PenLine size={13} /> 問いを書かずに保存
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NewFieldNote() {
    return (
        <Suspense>
            <NewFieldNoteInner />
        </Suspense>
    );
}