import { NextResponse } from 'next/server';
import { getNotices, getActivePopupNotices, createNotice, updateNoticePopup } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activePopup = searchParams.get('active_popup') === 'true';

    if (activePopup) {
      const data = await getActivePopupNotices();
      return NextResponse.json({ success: true, data });
    }

    const data = await getNotices();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, content, isPinned, isPopup, popupStartDate, popupEndDate, author, authorEmail } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required.' }, { status: 400 });
    }

    const newNotice = await createNotice({
      title,
      category: category || 'Notice',
      content,
      isPinned: !!isPinned,
      isPopup: !!isPopup,
      popupStartDate: popupStartDate || undefined,
      popupEndDate: popupEndDate || undefined,
      author: author || 'GTA',
      authorEmail: authorEmail || 'gta@gtakorea.org',
    });

    return NextResponse.json({ success: true, data: newNotice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isPopup, popupStartDate, popupEndDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID is required.' }, { status: 400 });
    }

    const updated = await updateNoticePopup(id, !!isPopup, popupStartDate, popupEndDate);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Notice not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
