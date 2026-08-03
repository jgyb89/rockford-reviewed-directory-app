import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

    if (!GRAPHQL_URL) {
      return NextResponse.json(
        { errors: [{ message: 'GraphQL API URL not configured' }] },
        { status: 500 }
      );
    }

    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CCR-NextJS-Frontend-Proxy/1.0',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('GraphQL Proxy Error:', error);
    return NextResponse.json(
      { errors: [{ message: 'Internal Server Error fetching from GraphQL' }] },
      { status: 500 }
    );
  }
}
