import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    if (!text?.trim()) {
        return NextResponse.json({ error: "テキストが必要です" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
以下の日常の観察・気づきを読んで、深く考える価値のある「問い」を3〜5つ生成してください。

【観察・気づき】
${text}

【ルール】
- 問いは「なぜ〜」「〜とは何か」「〜は〜なのか」の形式を使う
- 答えが簡単に出ない、長く考え続けられる問いにする
- 観察から自然に生まれる問いにする
- 哲学的・人間的な深みのある問いを優先する
- 答えを含めない

【出力形式】
JSON配列のみを返す。説明文は不要。
["問い1", "問い2", "問い3"]
`;

    try {
        const result = await model.generateContent(prompt);
        const raw = result.response.text();
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const questions = JSON.parse(cleaned);
        return NextResponse.json({ questions });
    // } catch (e) {
    //     return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    // }
    } catch (e) {
    console.error("Gemini error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}