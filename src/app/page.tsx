"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, QuestionStatus } from "@/lib/db/schema";
import { Leaf, Flower2, RefreshCw, Snowflake, Sprout, ChevronRight, Plus, Eye, Feather, ChevronDown, Check, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const STATUS_META: Record<QuestionStatus, { Icon: React.ElementType; label: string; color: string }> = {
    sprout: { Icon: Sprout, label: "発芽", color: "#5A8A52" },
    growing: { Icon: Leaf, label: "成長中", color: "#4A6741" },
    bloomed: { Icon: Flower2, label: "開花", color: "#A0607A" },
    rethinking: { Icon: RefreshCw, label: "再考中", color: "#7A6830" },
    dormant: { Icon: Snowflake, label: "休眠中", color: "#6A7A8A" },
};

const STATUS_ORDER: QuestionStatus[] = ["sprout", "growing", "bloomed", "rethinking", "dormant"];

const SORT_OPTIONS = [
    { value: "last_thought", label: "最近考えた順" },
    { value: "oldest", label: "長く付き合っている順" },
    { value: "created", label: "作成日順" },
] as const;

function daysSince(date?: Date) {
    if (!date) return null;
    return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export default function Home() {
    const [sort, setSort] = useState<"last_thought" | "oldest" | "created">("last_thought");
    const [filterStatuses, setFilterStatuses] = useState<QuestionStatus[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ドロップダウン外クリックで閉じる
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleStatus = (s: QuestionStatus) => {
        setFilterStatuses(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const clearFilter = () => setFilterStatuses([]);

    const questions = useLiveQuery(async () => {
        const all = await db.questions.toArray();
        const filtered = filterStatuses.length === 0
            ? all
            : all.filter(q => filterStatuses.includes(q.status));
        return filtered.sort((a, b) => {
            if (sort === "last_thought") {
                return (b.last_thought_at?.getTime() ?? b.created_at.getTime())
                    - (a.last_thought_at?.getTime() ?? a.created_at.getTime());
            }
            if (sort === "oldest") return a.created_at.getTime() - b.created_at.getTime();
            return b.created_at.getTime() - a.created_at.getTime();
        });
    }, [sort, filterStatuses]);

    const allQuestions = useLiveQuery(() => db.questions.toArray());
    const countByStatus = (s: QuestionStatus) =>
        (allQuestions ?? []).filter(q => q.status === s).length;

    const isFiltering = filterStatuses.length > 0;

    // ドロップダウンのラベル
    const filterLabel = isFiltering
        ? filterStatuses.map(s => STATUS_META[s].label).join("・")
        : "ステータス";

    return (
        <div style={{ paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ padding: "28px 20px 16px", borderBottom: "1px solid #C8BFA8" }}>
                <h1 style={{
                    fontFamily: "var(--font-noto-serif-jp), serif",
                    fontSize: 21, fontWeight: 600, color: "#1C1C1A", margin: 0,
                }}>
                    問いの庭
                </h1>
                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "5px 0 0" }}>
                    {allQuestions?.length ?? 0}つの問いが育っています
                </p>
            </div>

            {/* フィルター＋ソート */}
            <div style={{ padding: "12px 20px", display: "flex", gap: 8, alignItems: "center" }}>

                {/* ステータスドロップダウン */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                    <button
                        onClick={() => setDropdownOpen(v => !v)}
                        style={{
                            fontFamily: "system-ui", fontSize: 11, padding: "5px 10px",
                            borderRadius: 20,
                            border: `1px solid ${isFiltering ? "#4A6741" : "#C8BFA8"}`,
                            background: isFiltering ? "#EBF0E9" : "transparent",
                            color: isFiltering ? "#4A6741" : "#7A7060",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                            maxWidth: 180, overflow: "hidden",
                        }}>
                        <Leaf size={11} strokeWidth={1.8} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {filterLabel}
                        </span>
                        <ChevronDown size={11} strokeWidth={1.8} style={{
                            flexShrink: 0,
                            transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s",
                        }} />
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
                            background: "#fff", borderRadius: 8, border: "1px solid #C8BFA8",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: 6, minWidth: 160,
                        }}>
                            {STATUS_ORDER.map(s => {
                                const { Icon, label, color } = STATUS_META[s];
                                const count = countByStatus(s);
                                const selected = filterStatuses.includes(s);
                                return (
                                    <button key={s} onClick={() => toggleStatus(s)} style={{
                                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                                        padding: "8px 10px", border: "none", borderRadius: 4,
                                        background: selected ? color + "18" : "transparent",
                                        color: selected ? color : "#3D3B35",
                                        fontFamily: "system-ui", fontSize: 12, cursor: "pointer",
                                        textAlign: "left",
                                    }}>
                                        <Icon size={12} strokeWidth={1.8} />
                                        <span style={{ flex: 1 }}>{label}</span>
                                        <span style={{ fontSize: 10, color: "#7A7060" }}>{count}</span>
                                        {selected && <Check size={11} strokeWidth={2} />}
                                    </button>
                                );
                            })}
                            {isFiltering && (
                                <>
                                    <div style={{ height: 1, background: "#F2EDE4", margin: "4px 0" }} />
                                    <button onClick={clearFilter} style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: "100%", padding: "7px 10px", border: "none", borderRadius: 4,
                                        background: "transparent", color: "#7A7060",
                                        fontFamily: "system-ui", fontSize: 11, cursor: "pointer",
                                    }}>
                                        フィルターをクリア
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ソート */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                    {SORT_OPTIONS.map(o => (
                        <button key={o.value} onClick={() => setSort(o.value)} style={{
                            fontFamily: "system-ui", fontSize: 11, padding: "5px 10px", whiteSpace: "nowrap",
                            borderRadius: 20, border: `1px solid ${sort === o.value ? "#4A6741" : "#C8BFA8"}`,
                            background: sort === o.value ? "#EBF0E9" : "transparent",
                            color: sort === o.value ? "#4A6741" : "#7A7060",
                            cursor: "pointer", flexShrink: 0,
                        }}>
                            {o.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div style={{ padding: "0 20px" }}>
                {questions?.length === 0 && (
                    <div style={{ padding: "48px 0", textAlign: "center" }}>
                        <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#7A7060", lineHeight: 1.8 }}>
                            {isFiltering
                                ? `該当する問いがありません。`
                                : "まだ問いがありません。\n最初の問いを植えてみましょう。"}
                        </p>
                    </div>
                )}
                {questions?.map(q => {
                    const { Icon, label, color } = STATUS_META[q.status];
                    const days = daysSince(q.last_thought_at ?? q.created_at);
                    return (
                        <Link key={q.id} href={`/questions/${q.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ padding: "15px 0", borderBottom: "1px solid #F2EDE4", cursor: "pointer" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                    <p style={{
                                        fontFamily: "var(--font-noto-serif-jp), serif",
                                        fontSize: 15, color: "#1C1C1A", margin: 0, lineHeight: 1.65,
                                    }}>
                                        {q.title}
                                    </p>
                                    <ChevronRight size={14} color="#C8BFA8" style={{ flexShrink: 0, marginTop: 3 }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 4,
                                        fontSize: 11, color, background: color + "18",
                                        borderRadius: 4, padding: "2px 7px", fontFamily: "system-ui",
                                    }}>
                                        <Icon size={11} strokeWidth={1.8} />{label}
                                    </span>
                                    <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060" }}>
                                        思考 {q.thought_count}回
                                    </span>
                                    {days !== null && (
                                        <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060" }}>
                                            {days}日前に考えた
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* FAB */}
            <Link href="/questions/new">
                <button style={{
                    position: "fixed", bottom: 72, right: 20,
                    width: 50, height: 50, borderRadius: "50%",
                    background: "#4A6741", border: "none", color: "#fff",
                    cursor: "pointer", boxShadow: "0 2px 12px rgba(74,103,65,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 99,
                }}>
                    <Plus size={22} strokeWidth={2} />
                </button>
            </Link>

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
                            color: href === "/" ? "#4A6741" : "#7A7060", padding: "4px 20px",
                        }}>
                            <Icon size={20} strokeWidth={href === "/" ? 2 : 1.6} />
                            <span style={{ fontFamily: "system-ui", fontSize: 10 }}>{label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}