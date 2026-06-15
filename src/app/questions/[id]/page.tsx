"use client";

import { db } from "@/lib/db/schema";
import { useLiveQuery } from "dexie-react-hooks";
import {
    ArrowLeft, Calendar, Clock, PenLine, Trash2,
    Sprout, Leaf, Flower2, RefreshCw, Snowflake
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionStatus } from "@/lib/db/schema";

const STATUS_META: Record<QuestionStatus, { Icon: React.ElementType; label: string; color: string }> = {
    sprout: { Icon: Sprout, label: "発芽", color: "#5A8A52" },
    growing: { Icon: Leaf, label: "成長中", color: "#4A6741" },
    bloomed: { Icon: Flower2, label: "開花", color: "#A0607A" },
    rethinking: { Icon: RefreshCw, label: "再考中", color: "#7A6830" },
    dormant: { Icon: Snowflake, label: "休眠中", color: "#6A7A8A" },
};

const STATUS_ORDER: QuestionStatus[] = ["sprout", "growing", "bloomed", "rethinking", "dormant"];

function daysSince(date: Date) {
    return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function formatDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function QuestionDetail() {
    const { id } = useParams();
    const questionId = Number(id);
    const router = useRouter();

    const [showInput, setShowInput] = useState(false);
    const [newThought, setNewThought] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [deletingThoughtId, setDeletingThoughtId] = useState<number | null>(null);

    const question = useLiveQuery(() => db.questions.get(questionId), [questionId]);
    const thoughts = useLiveQuery(() =>
        db.thoughts.where("question_id").equals(questionId).sortBy("created_at"),
        [questionId]
    );

    const handleSaveThought = async () => {
        if (!newThought.trim()) return;
        setSaving(true);
        const now = new Date();
        await db.thoughts.add({ question_id: questionId, body: newThought.trim(), created_at: now });
        await db.questions.update(questionId, {
            last_thought_at: now,
            last_opened_at: now,
            thought_count: (question?.thought_count ?? 0) + 1,
        });
        setNewThought("");
        setShowInput(false);
        setSaving(false);
    };

    const handleDeleteQuestion = async () => {
        await db.thoughts.where("question_id").equals(questionId).delete();
        await db.questions.delete(questionId);
        router.push("/");
    };

    const handleDeleteThought = async (thoughtId: number) => {
        await db.thoughts.delete(thoughtId);
        await db.questions.update(questionId, {
            thought_count: Math.max((question?.thought_count ?? 1) - 1, 0),
        });
        setDeletingThoughtId(null);
    };

    const handleStatusChange = async (status: QuestionStatus) => {
        await db.questions.update(questionId, { status });
        setShowStatusPicker(false);
    };

    if (!question) return (
        <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "system-ui", color: "#7A7060" }}>
            読み込み中...
        </div>
    );

    const { Icon, label, color } = STATUS_META[question.status];

    return (
        <div style={{ paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #C8BFA8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link href="/">
                        <button style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", padding: 4, display: "flex" }}>
                            <ArrowLeft size={18} strokeWidth={1.8} />
                        </button>
                    </Link>
                    <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060" }}>問いに戻る</span>
                </div>

                {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)} style={{
                        background: "none", border: "none", color: "#C8BFA8", cursor: "pointer", padding: 4, display: "flex",
                    }}>
                        <Trash2 size={16} strokeWidth={1.6} />
                    </button>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060" }}>削除しますか？</span>
                        <button onClick={handleDeleteQuestion} style={{
                            fontFamily: "system-ui", fontSize: 11, padding: "4px 10px",
                            background: "#C8493A", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer",
                        }}>削除</button>
                        <button onClick={() => setConfirmDelete(false)} style={{
                            fontFamily: "system-ui", fontSize: 11, padding: "4px 10px",
                            background: "transparent", border: "1px solid #C8BFA8", borderRadius: 4, color: "#7A7060", cursor: "pointer",
                        }}>戻る</button>
                    </div>
                )}
            </div>

            {/* Question */}
            <div style={{ padding: "24px 20px 0" }}>
                {/* ステータス（タップで変更） */}
                <div style={{ position: "relative", display: "inline-block" }}>
                    <button onClick={() => setShowStatusPicker(v => !v)} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontFamily: "system-ui",
                        color, background: color + "18",
                        borderRadius: 4, padding: "2px 7px",
                        border: "none", cursor: "pointer",
                    }}>
                        <Icon size={11} strokeWidth={1.8} />{label} ▾
                    </button>

                    {showStatusPicker && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
                            background: "#fff", borderRadius: 8, border: "1px solid #C8BFA8",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: 6, minWidth: 140,
                        }}>
                            {STATUS_ORDER.map(s => {
                                const { Icon: SI, label: sl, color: sc } = STATUS_META[s];
                                return (
                                    <button key={s} onClick={() => handleStatusChange(s)} style={{
                                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                                        padding: "8px 10px", border: "none", borderRadius: 4,
                                        background: question.status === s ? sc + "18" : "transparent",
                                        color: sc, fontFamily: "system-ui", fontSize: 12, cursor: "pointer",
                                        textAlign: "left",
                                    }}>
                                        <SI size={12} strokeWidth={1.8} />{sl}
                                        {question.status === s && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <h2 style={{
                    fontFamily: "var(--font-noto-serif-jp), serif",
                    fontSize: 19, fontWeight: 600, color: "#1C1C1A",
                    margin: "12px 0 6px", lineHeight: 1.65,
                }}>
                    {question.title}
                </h2>
                {question.memo && (
                    <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 13, color: "#7A7060", lineHeight: 1.7, margin: "0 0 8px" }}>
                        {question.memo}
                    </p>
                )}
                <div style={{ display: "flex", gap: 14, fontFamily: "system-ui", fontSize: 11, color: "#7A7060" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Calendar size={11} /> {daysSince(question.created_at)}日前に植えた
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <PenLine size={11} /> 思考 {question.thought_count}回
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div style={{ padding: "28px 20px 0" }}>
                <p style={{ fontFamily: "system-ui", fontSize: 10, color: "#7A7060", margin: "0 0 20px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    思考の記録
                </p>
                <div style={{ position: "relative" }}>
                    {(thoughts?.length ?? 0) > 0 && (
                        <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 1, background: "#C8BFA8" }} />
                    )}
                    {[...(thoughts ?? [])].reverse().map(t => (
                        <div key={t.id} style={{ display: "flex", gap: 18, marginBottom: 26, position: "relative" }}>
                            <div style={{
                                width: 13, height: 13, borderRadius: "50%", flexShrink: 0, marginTop: 4, zIndex: 1,
                                background: "#FAFAF7", border: "2px solid #C8BFA8",
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 5px", display: "flex", alignItems: "center", gap: 4 }}>
                                        <Clock size={10} /> {formatDate(t.created_at)}
                                    </p>
                                    {deletingThoughtId === t.id ? (
                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                            <span style={{ fontFamily: "system-ui", fontSize: 10, color: "#7A7060" }}>削除？</span>
                                            <button onClick={() => handleDeleteThought(t.id!)} style={{
                                                fontFamily: "system-ui", fontSize: 10, padding: "2px 8px",
                                                background: "#C8493A", border: "none", borderRadius: 3, color: "#fff", cursor: "pointer",
                                            }}>削除</button>
                                            <button onClick={() => setDeletingThoughtId(null)} style={{
                                                fontFamily: "system-ui", fontSize: 10, padding: "2px 8px",
                                                background: "transparent", border: "1px solid #C8BFA8", borderRadius: 3, color: "#7A7060", cursor: "pointer",
                                            }}>戻る</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeletingThoughtId(t.id!)} style={{
                                            background: "none", border: "none", color: "#C8BFA8", cursor: "pointer", padding: 2, display: "flex",
                                        }}>
                                            <Trash2 size={13} strokeWidth={1.5} />
                                        </button>
                                    )}
                                </div>
                                <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#3D3B35", margin: 0, lineHeight: 1.8 }}>
                                    {t.body}
                                </p>
                            </div>
                        </div>
                    ))}
                    {(thoughts?.length ?? 0) === 0 && (
                        <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 13, color: "#7A7060", fontStyle: "italic", paddingLeft: 28 }}>
                            まだ記録がありません
                        </p>
                    )}
                </div>
            </div>

            {/* Add thought */}
            <div style={{ padding: "8px 20px 0" }}>
                {!showInput ? (
                    <button onClick={() => setShowInput(true)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontFamily: "system-ui", fontSize: 13, padding: "10px 18px",
                        borderRadius: 6, border: "1px solid #4A6741",
                        background: "transparent", color: "#4A6741", cursor: "pointer",
                    }}>
                        <PenLine size={14} strokeWidth={1.8} />
                        今日時点の考えを記録する
                    </button>
                ) : (
                    <div style={{ background: "#F2EDE4", borderRadius: 8, padding: 16 }}>
                        <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={10} /> {formatDate(new Date())}　今日時点の考え
                        </p>
                        <textarea
                            value={newThought}
                            onChange={e => setNewThought(e.target.value)}
                            placeholder="今、この問いについてどう考えていますか"
                            autoFocus
                            style={{
                                width: "100%", minHeight: 100, border: "none", background: "transparent",
                                fontFamily: "var(--font-noto-serif-jp), serif",
                                fontSize: 14, color: "#1C1C1A",
                                resize: "vertical", outline: "none", lineHeight: 1.75,
                            }}
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                            <button onClick={() => { setShowInput(false); setNewThought(""); }} style={{
                                fontFamily: "system-ui", fontSize: 12, padding: "6px 14px",
                                border: "1px solid #C8BFA8", borderRadius: 4,
                                background: "transparent", color: "#7A7060", cursor: "pointer",
                            }}>
                                キャンセル
                            </button>
                            <button onClick={handleSaveThought} disabled={!newThought.trim() || saving} style={{
                                fontFamily: "system-ui", fontSize: 12, padding: "6px 14px",
                                border: "none", borderRadius: 4,
                                background: newThought.trim() ? "#4A6741" : "#C8BFA8",
                                color: "#fff", cursor: newThought.trim() ? "pointer" : "default",
                            }}>
                                {saving ? "保存中..." : "保存する"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}