"use client";

import { db } from "@/lib/db/schema";
import { useLiveQuery } from "dexie-react-hooks";
import { Leaf, Eye, PenLine, Calendar, Feather, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Question } from "@/lib/db/schema";

function daysSince(date: Date) {
    return Math.floor((Date.now() - date.getTime()) / 86400000);
}

const STATUS_META = {
    sprout: { label: "発芽", color: "#5A8A52" },
    growing: { label: "成長中", color: "#4A6741" },
    bloomed: { label: "開花", color: "#A0607A" },
    rethinking: { label: "再考中", color: "#7A6830" },
    dormant: { label: "休眠中", color: "#6A7A8A" },
} as const;

export default function ReunionPage() {
    const [question, setQuestion] = useState<Question | null>(null);
    const [done, setDone] = useState(false);
    const [thought, setThought] = useState("");
    const [saving, setSaving] = useState(false);

    const allQuestions = useLiveQuery(() => db.questions.toArray());

    useEffect(() => {
        if (!allQuestions) return;
        const threshold = Date.now() - 30 * 86400000;
        const candidates = allQuestions.filter(q => {
            const openedAt = q.last_opened_at?.getTime() ?? q.created_at.getTime();
            return openedAt < threshold;
        });
        if (candidates.length === 0) return;
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        setQuestion(picked);
    }, [allQuestions]);

    const handleSave = async () => {
        if (!question?.id || !thought.trim()) return;
        setSaving(true);
        const now = new Date();
        await db.thoughts.add({ question_id: question.id, body: thought.trim(), created_at: now });
        await db.questions.update(question.id, {
            last_thought_at: now,
            last_opened_at: now,
            thought_count: (question.thought_count ?? 0) + 1,
        });
        setDone(true);
        setSaving(false);
    };

    const handleSkip = async () => {
        if (!question?.id) return;
        await db.questions.update(question.id, { last_opened_at: new Date() });
        setDone(true);
    };

    return (
        <div style={{ paddingBottom: 80 }}>
            <div style={{ padding: "28px 20px 16px", borderBottom: "1px solid #C8BFA8" }}>
                <h1 style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 21, fontWeight: 600, color: "#1C1C1A", margin: 0 }}>
                    問いと再会する
                </h1>
                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "5px 0 0" }}>
                    30日以上開いていない問いと出会う
                </p>
            </div>

            {!question && !done && (
                <div style={{ padding: "64px 24px", textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#7A7060", lineHeight: 1.8 }}>
                        再会できる問いがまだありません。<br />問いを植えてから30日後に会えます。
                    </p>
                </div>
            )}

            {question && !done && (
                <div style={{ padding: "48px 24px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                        <Eye size={13} color="#7A7060" strokeWidth={1.6} />
                        <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: 0, letterSpacing: "0.06em" }}>
                            {daysSince(question.last_opened_at ?? question.created_at)}日ぶりの再会
                        </p>
                    </div>
                    <h2 style={{
                        fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 20, fontWeight: 600,
                        color: "#1C1C1A", margin: "0 auto 16px", lineHeight: 1.65,
                        letterSpacing: "0.02em", maxWidth: 280, textAlign: "center",
                    }}>
                        {question.title}
                    </h2>
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 36 }}>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11,
                            color: STATUS_META[question.status].color,
                            background: STATUS_META[question.status].color + "18",
                            borderRadius: 4, padding: "2px 7px",
                        }}>
                            {STATUS_META[question.status].label}
                        </span>
                        <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", display: "flex", alignItems: "center", gap: 3 }}>
                            <PenLine size={10} /> 思考 {question.thought_count}回
                        </span>
                    </div>

                    <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#3D3B35", textAlign: "center", margin: "0 0 20px", lineHeight: 1.7 }}>
                        今なら、どう考えますか？
                    </p>
                    <textarea
                        value={thought}
                        onChange={e => setThought(e.target.value)}
                        placeholder="思ったことをそのまま書いてください"
                        style={{
                            width: "100%", minHeight: 120, background: "#F2EDE4",
                            border: "none", borderRadius: 8,
                            fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#1C1C1A",
                            resize: "none", outline: "none", lineHeight: 1.75,
                            padding: 14,
                        }}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                        <button onClick={handleSkip} style={{
                            flex: 1, padding: "11px", border: "1px solid #C8BFA8",
                            borderRadius: 6, background: "transparent", color: "#7A7060",
                            fontFamily: "system-ui", fontSize: 12, cursor: "pointer",
                        }}>
                            今日はスキップ
                        </button>
                        <button onClick={handleSave} disabled={!thought.trim() || saving} style={{
                            flex: 2, padding: "11px", border: "none", borderRadius: 6,
                            background: thought.trim() ? "#4A6741" : "#C8BFA8",
                            color: "#fff", fontFamily: "system-ui", fontSize: 12,
                            cursor: thought.trim() ? "pointer" : "default",
                        }}>
                            {saving ? "保存中..." : "記録して再会する"}
                        </button>
                    </div>
                </div>
            )}

            {done && (
                <div style={{ padding: "64px 24px 0", textAlign: "center" }}>
                    <Leaf size={36} color="#4A6741" strokeWidth={1.4} style={{ marginBottom: 20 }} />
                    <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 15, color: "#3D3B35", lineHeight: 1.8, margin: 0 }}>
                        再会できました。<br />この問いはまだ、あなたの庭にあります。
                    </p>
                    <Link href="/">
                        <button style={{
                            marginTop: 32, padding: "10px 24px",
                            border: "1px solid #C8BFA8", borderRadius: 20,
                            background: "transparent", color: "#7A7060",
                            fontFamily: "system-ui", fontSize: 12, cursor: "pointer",
                        }}>
                            庭に戻る
                        </button>
                    </Link>
                </div>
            )}

            {/* Bottom Nav */}
            <div style={{
                position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: "100%", maxWidth: 480,
                background: "#FAFAF7", borderTop: "1px solid #C8BFA8",
                display: "flex", justifyContent: "space-around", padding: "8px 0 12px",
                zIndex: 100,
            }}>
                {[
                    { href: "/", Icon: Leaf, label: "問い" },
                    { href: "/fieldnotes", Icon: Feather, label: "日記" },
                    { href: "/reunion", Icon: Eye, label: "再会" },
                    { href: "/settings", Icon: Settings, label: "設定" },
                ].map(({ href, Icon, label }) => (
                    <Link key={href} href={href} style={{ textDecoration: "none" }}>
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                            color: href === "/reunion" ? "#4A6741" : "#7A7060", padding: "4px 20px",
                        }}>
                            <Icon size={20} strokeWidth={href === "/reunion" ? 2 : 1.6} />
                            <span style={{ fontFamily: "system-ui", fontSize: 10 }}>{label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}