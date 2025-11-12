import { NextResponse } from "next/server";

export interface DatamuseSuggestedWord {
  word: string;
  score: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("w");

  if (!word || word.trim().length === 0) {
    return new Response("No word provided", { status: 400 });
  }
  const res = await fetch(`https://api.datamuse.com/sug?s=${word.trim()}`);
  const data = await res.json();
  const suggestedWords = data.map((item: DatamuseSuggestedWord) => item.word);

  return NextResponse.json(suggestedWords, { status: 200 });
}
