import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('anilist_token');
  cookieStore.delete('anilist_user');
  return NextResponse.redirect(new URL('/', request.url));
}
