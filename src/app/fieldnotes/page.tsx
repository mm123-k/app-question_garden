"use client";

import { db, FieldNote } from "@/lib/db/schema";
import { useLiveQuery } from "dexie-react-hooks";
import { Calendar, BookOpen, Plus, PenLine, Leaf, Feather, Eye, Settings} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function buildCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
}

function toDateStr(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function FieldNotesPage() {
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const fieldnotes = useLiveQuery(() => db.fieldnotes.orderBy("created_at").reverse().toArray());

    const DOW = ["日", "月", "火", "水", "木", "金", "土"];
    const cells = buildCalendarDays(calYear, calMonth);

    const notesByDate = (fieldnotes ?? []).reduce((acc, note) => {
        const key = toDateStr(note.created_at.getFullYear(), note.created_at.getMonth(), note.created_at.getDate());
        if (!acc[key]) acc[key] = [];
        acc[key].push(note);
        return acc;
    }, {} as Record<string, FieldNote[]>);


    const selectedDateStr = selectedDay ? toDateStr(calYear, calMonth, selectedDay) : null;
    const selectedNotes = selectedDateStr ? (notesByDate[selectedDateStr] ?? []) : [];

    const prevMonth = () => {
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
        else setCalMonth(m => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
        else setCalMonth(m => m + 1);
        setSelectedDay(null);
    };

    return (
        <div style={{ paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ padding: "28px 20px 16px", borderBottom: "1px solid #C8BFA8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 21, fontWeight: 600, color: "#1C1C1A", margin: 0 }}>
                        フィールドワーク日記
                    </h1>
                    <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "5px 0 0" }}>
                        日常の観察・違和感・気づきを記録する
                    </p>
                </div>
                {/* Toggle */}
                <div style={{ display: "flex", gap: 2, background: "#F2EDE4", borderRadius: 6, padding: 3 }}>
                    {(["calendar", "list"] as const).map(mode => (
                        <button key={mode} onClick={() => setViewMode(mode)} style={{
                            padding: "5px 8px", borderRadius: 4, border: "none", cursor: "pointer",
                            background: viewMode === mode ? "#fff" : "transparent",
                            color: viewMode === mode ? "#4A6741" : "#7A7060",
                            boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            display: "flex", alignItems: "center",
                        }}>
                            {mode === "calendar" ? <Calendar size={15} strokeWidth={1.8} /> : <BookOpen size={15} strokeWidth={1.8} />}
                        </button>
                    ))}
                </div>
            </div>

            {viewMode === "calendar" ? (
                <div style={{ padding: "16px 20px" }}>
                    {/* Month nav */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <button onClick={prevMonth} style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", fontSize: 20 }}>‹</button>
                        <span style={{ fontFamily: "system-ui", fontSize: 13, color: "#1C1C1A" }}>
                            {calYear}年 {calMonth + 1}月
                        </span>
                        <button onClick={nextMonth} style={{ background: "none", border: "none", color: "#7A7060", cursor: "pointer", fontSize: 20 }}>›</button>
                    </div>

                    {/* DOW */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
                        {DOW.map(d => (
                            <div key={d} style={{ textAlign: "center", fontFamily: "system-ui", fontSize: 10, color: "#7A7060", padding: "2px 0" }}>{d}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
                        {cells.map((day, i) => {
                            if (!day) return <div key={`e-${i}`} />;
                            const dateStr = toDateStr(calYear, calMonth, day);
                            const hasNote = !!notesByDate[dateStr];
                            const isSelected = selectedDay === day;
                            const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
                            return (
                                <div key={day} onClick={() => setSelectedDay(isSelected ? null : day)} style={{
                                    display: "flex", flexDirection: "column", alignItems: "center",
                                    padding: "6px 0", cursor: hasNote ? "pointer" : "default",
                                    borderRadius: 6, background: isSelected ? "#EBF0E9" : "transparent",
                                }}>
                                    <span style={{
                                        fontFamily: "system-ui", fontSize: 13,
                                        width: 28, height: 28,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        borderRadius: "50%",
                                        background: isSelected ? "#4A6741" : "transparent",
                                        color: isSelected ? "#fff" : isToday ? "#4A6741" : "#1C1C1A",
                                        fontWeight: isToday ? 600 : 400,
                                    }}>
                                        {day}
                                    </span>
                                    {hasNote && (
                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "#4A6741" : "#7A7060", marginTop: 2 }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Preview */}
                    {selectedDay && (
                        <div style={{ marginTop: 20, borderTop: "1px solid #C8BFA8", paddingTop: 16 }}>
                            {selectedNotes.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {selectedNotes.map(note => (
                                        <Link key={note.id} href={`/fieldnotes/${note.id}`} style={{ textDecoration: "none" }}>
                                            <div style={{ padding: "10px 12px", background: "#F2EDE4", borderRadius: 6 }}>
                                                {note.title && (
                                                    <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 4px" }}>{note.title}</p>
                                                )}
                                                <p style={{
                                                    fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#3D3B35",
                                                    margin: 0, lineHeight: 1.7,
                                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                                                } as React.CSSProperties}>
                                                    {note.body}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href={`/fieldnotes/new?date=${toDateStr(calYear, calMonth, selectedDay)}`}>
                                        <button style={{
                                            fontFamily: "system-ui", fontSize: 12, padding: "7px 16px",
                                            border: "1px solid #4A6741", borderRadius: 20,
                                            background: "transparent", color: "#4A6741", cursor: "pointer",
                                            display: "inline-flex", alignItems: "center", gap: 5,
                                        }}>
                                            <PenLine size={12} /> この日にもう1件書く
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "16px 0" }}>
                                    <p style={{ fontFamily: "system-ui", fontSize: 12, color: "#7A7060", margin: "0 0 12px" }}>
                                        {calMonth + 1}月{selectedDay}日の記録はありません
                                    </p>
                                    <Link href={`/fieldnotes/new?date=${toDateStr(calYear, calMonth, selectedDay)}`}>
                                        <button style={{
                                            fontFamily: "system-ui", fontSize: 12, padding: "7px 16px",
                                            border: "1px solid #4A6741", borderRadius: 20,
                                            background: "transparent", color: "#4A6741", cursor: "pointer",
                                            display: "inline-flex", alignItems: "center", gap: 5,
                                        }}>
                                            <PenLine size={12} /> この日の記録を書く
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: "8px 20px" }}>
                    {(fieldnotes?.length ?? 0) === 0 && (
                        <div style={{ padding: "48px 0", textAlign: "center" }}>
                            <p style={{ fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#7A7060", lineHeight: 1.8 }}>
                                まだ日記がありません。
                            </p>
                        </div>
                    )}
                    {fieldnotes?.map(note => (
                        <Link key={note.id} href={`/fieldnotes/${note.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ padding: "16px 0", borderBottom: "1px solid #F2EDE4", cursor: "pointer" }}>
                                {note.title && (
                                    <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "0 0 5px" }}>{note.title}</p>
                                )}
                                <p style={{
                                    fontFamily: "var(--font-noto-serif-jp), serif", fontSize: 14, color: "#3D3B35",
                                    margin: 0, lineHeight: 1.7,
                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                                } as React.CSSProperties}>
                                    {note.body}
                                </p>
                                <p style={{ fontFamily: "system-ui", fontSize: 11, color: "#7A7060", margin: "8px 0 0", display: "flex", alignItems: "center", gap: 3 }}>
                                    <Calendar size={10} /> {note.created_at.toLocaleDateString("ja-JP")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* FAB */}
            <Link href={`/fieldnotes/new?date=${toDateStr(calYear, calMonth, selectedDay!)}`}>
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
                            color: href === "/fieldnotes" ? "#4A6741" : "#7A7060", padding: "4px 20px",
                        }}>
                            <Icon size={20} strokeWidth={href === "/fieldnotes" ? 2 : 1.6} />
                            <span style={{ fontFamily: "system-ui", fontSize: 10 }}>{label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}