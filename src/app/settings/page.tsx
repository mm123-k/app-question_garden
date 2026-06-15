"use client";

import { db } from "@/lib/db/schema";
import { ArrowLeft, Download, FileJson, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function formatDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(date: Date) {
    return `${formatDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

async function exportJSON() {
    const questions = await db.questions.toArray();
    const thoughts = await db.thoughts.toArray();
    const quotes = await db.quotes.toArray();
    const fieldnotes = await db.fieldnotes.toArray();

    const data = {
        exported_at: new Date().toISOString(),
        questions: questions.map(q => ({
            ...q,
            thoughts: thoughts.filter(t => t.question_id === q.id),
            quotes: quotes.filter(qt => qt.question_id === q.id),
        })),
        fieldnotes,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question-garden-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function exportMarkdown() {
    const questions = await db.questions.toArray();
    const thoughts = await db.thoughts.toArray();
    const quotes = await db.quotes.toArray();
    const fieldnotes = await db.fieldnotes.toArray();

    const STATUS_LABEL: Record<string, string> = {
        sprout: "🌱 発芽",
        growing: "🌿 成長中",
        bloomed: "🌸 開花",
        rethinking: "🔄 再考中",
        dormant: "❄️ 休眠中",
    };

    let md = `# 問いの庭\n\nエクスポート日: ${formatDateTime(new Date())}\n\n---\n\n`;

    md += `# 問い一覧\n\n`;
    for (const q of questions) {
        md += `## ${q.title}\n\n`;
        md += `- 状態: ${STATUS_LABEL[q.status]}\n`;
        md += `- 作成: ${formatDate(q.created_at)}\n`;
        md += `- 思考回数: ${q.thought_count}回\n`;
        if (q.memo) md += `- メモ: ${q.memo}\n`;
        md += `\n`;

        const qThoughts = thoughts.filter(t => t.question_id === q.id)
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
        if (qThoughts.length > 0) {
            md += `### 思考の記録\n\n`;
            for (const t of qThoughts) {
                md += `**${formatDateTime(t.created_at)}**\n\n${t.body}\n\n---\n\n`;
            }
        }

        const qQuotes = quotes.filter(qt => qt.question_id === q.id);
        if (qQuotes.length > 0) {
            md += `### 引用\n\n`;
            for (const qt of qQuotes) {
                md += `> ${qt.quote_text}\n>\n> — ${qt.source}\n\n`;
                if (qt.memo) md += `${qt.memo}\n\n`;
            }
        }
        md += `\n`;
    }

    md += `---\n\n# フィールドワーク日記\n\n`;
    for (const note of fieldnotes.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())) {
        md += `## ${note.title ?? formatDate(note.created_at)}\n\n`;
        md += `*${formatDate(note.created_at)}*\n\n`;
        md += `${note.body}\n\n---\n\n`;
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question-garden-${formatDate(new Date())}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function SettingsPage() {
    const [exportingJSON, setExportingJSON] = useState(false);
    const [exportingMD, setExportingMD] = useState(false);

    const handleExportJSON = async () => {
        setExportingJSON(true);
        await exportJSON();
        setExportingJSON(false);
    };

    const handleExportMD = async () => {
        setExportingMD(true);
        await exportMarkdown();
        setExportingMD(false);
    };

    return (
        <div style={{ paddingBottom: 80 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #C8BFA8", display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/">
                    <button style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", padding: 4, display: "flex" }}>
                        <ArrowLeft size={18} strokeWidth={1.8} />
                    </button>
                </Link>
                <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060" }}>設定</span>
            </div>

            <div style={{ padding: "28px 20px" }}>
                <h2 style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 16, fontWeight: 600, color: "#1C1C1A", margin: "0 0 6px" }}>
                    データのエクスポート
                </h2>
                <p style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060", margin: "0 0 20px", lineHeight: 1.7 }}>
                    問い・思考記録・日記をファイルに書き出します。長期保存や移行に使えます。
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button onClick={handleExportJSON} disabled={exportingJSON} style={{
                        padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #C8BFA8", background: "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                        textAlign: "left",
                    }}>
                        <FileJson size={20} color="#4A6741" strokeWidth={1.6} />
                        <div>
                            <p style={{ fontFamily: "system-ui", fontSize: 13, color: "#1C1C1A", margin: "0 0 2px" }}>
                                {exportingJSON ? "書き出し中..." : "JSONで書き出す"}
                            </p>
                            <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: 0 }}>
                                データの完全バックアップ・将来の移行用
                            </p>
                        </div>
                        <Download size={14} color="#7A7060" strokeWidth={1.6} style={{ marginLeft: "auto" }} />
                    </button>

                    <button onClick={handleExportMD} disabled={exportingMD} style={{
                        padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #C8BFA8", background: "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                        textAlign: "left",
                    }}>
                        <FileText size={20} color="#4A6741" strokeWidth={1.6} />
                        <div>
                            <p style={{ fontFamily: "system-ui", fontSize: 13, color: "#1C1C1A", margin: "0 0 2px" }}>
                                {exportingMD ? "書き出し中..." : "Markdownで書き出す"}
                            </p>
                            <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: 0 }}>
                                人が読める形式・Obsidianなどで開ける
                            </p>
                        </div>
                        <Download size={14} color="#7A7060" strokeWidth={1.6} style={{ marginLeft: "auto" }} />
                    </button>
                </div>
            </div>
        </div>
    );
}