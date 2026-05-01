import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('anilist_user')?.value;

  if (!userCookie) {
    return NextResponse.json(null, { status: 401 });
  }

  try {
    return NextResponse.json(JSON.parse(userCookie));
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
