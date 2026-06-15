"use client";

import { db } from "@/lib/db/schema";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function FieldNoteDetail() {
    const { id } = useParams();
    const noteId = Number(id);
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);

    const note = useLiveQuery(() => db.fieldnotes.get(noteId), [noteId]);

    const handleDelete = async () => {
        await db.fieldnotes.delete(noteId);
        router.push("/fieldnotes");
    };

    if (!note) return (
        <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "system-ui", color: "#7A7060" }}>
            読み込み中...
        </div>
    );

    return (
        <div style={{ paddingBottom: 80 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #C8BFA8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link href="/fieldnotes">
                        <button style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", padding: 4, display: "flex" }}>
                            <ArrowLeft size={18} strokeWidth={1.8} />
                        </button>
                    </Link>
                    <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060" }}>日記に戻る</span>
                </div>

                {!confirming ? (
                    <button onClick={() => setConfirming(true)} style={{
                        background: "none", border: "none", color: "#C8BFA8", cursor: "pointer", padding: 4, display: "flex",
                    }}>
                        <Trash2 size={16} strokeWidth={1.6} />
                    </button>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060" }}>削除しますか？</span>
                        <button onClick={handleDelete} style={{
                            fontFamily: "system-ui", fontSize: 11, padding: "4px 10px",
                            background: "#C8493A", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer",
                        }}>削除</button>
                        <button onClick={() => setConfirming(false)} style={{
                            fontFamily: "system-ui", fontSize: 11, padding: "4px 10px",
                            background: "transparent", border: "1px solid #C8BFA8", borderRadius: 4, color: "#7A7060", cursor: "pointer",
                        }}>戻る</button>
                    </div>
                )}
            </div>

            <div style={{ padding: "28px 20px" }}>
                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} />
                    {note.created_at.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                </p>

                {note.title && (
                    <h2 style={{
                        fontFamily: "var(--font-noto-serif-jp), serif",
                        fontSize: 18, fontWeight: 600, color: "#1C1C1A",
                        margin: "0 0 16px", lineHeight: 1.6,
                    }}>
                        {note.title}
                    </h2>
                )}

                <p style={{
                    fontFamily: "var(--font-noto-serif-jp), serif",
                    fontSize: 15, color: "#3D3B35",
                    lineHeight: 1.9, margin: 0,
                    whiteSpace: "pre-wrap",
                }}>
                    {note.body}
                </p>
            </div>
        </div>
    );
}