import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv';
import { DEFAULT_ROTATION_CONFIG, RotationConfig } from '@/features/schedule/lib/schedule';

const KEY = 'rotation:config';

export async function GET() {
  const config = await kvGet<RotationConfig>(KEY);
  return NextResponse.json(config ?? DEFAULT_ROTATION_CONFIG);
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as RotationConfig;
  await kvSet(KEY, body);
  return NextResponse.json(body);
}
