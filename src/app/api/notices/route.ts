import { NextResponse } from 'next/server';
import { getNotices, createNotice } from '@/lib/db';

export async function GET() {
  try {
    const data = await getNotices();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, content, isPinned, author, authorEmail } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required.' }, { status: 400 });
    }

    const newNotice = await createNotice({
      title,
      category: category || 'Notice',
      content,
      isPinned: !!isPinned,
      author: author || 'GTA',
      authorEmail: authorEmail || 'gta@gtakorea.org',
    });

    return NextResponse.json({ success: true, data: newNotice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
