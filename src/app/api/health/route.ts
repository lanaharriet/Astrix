import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { isMongoConfigured } from '@/lib/db-server';

const startupTime = Date.now();

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export async function GET() {
  try {
    let dbStatus = 'disconnected';
    let isDbHealthy = false;
    
    if (isMongoConfigured()) {
      const readyState = mongoose.connection.readyState;
      dbStatus = readyState === 1 ? 'connected' : 'disconnected';
      isDbHealthy = readyState === 1;
    } else {
      dbStatus = 'connected'; // Local JSON db fallback mode is automatically connected
      isDbHealthy = true;
    }

    const groqAvailable = !!process.env.GROQ_API_KEY ? 'available' : 'unavailable';
    const isGroqHealthy = !!process.env.GROQ_API_KEY;

    const memory = process.memoryUsage();
    const memoryString = `RSS: ${(memory.rss / 1024 / 1024).toFixed(1)}MB | Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(1)}MB`;

    const isHealthy = isDbHealthy && isGroqHealthy;

    const responsePayload = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbStatus,
      groq: groqAvailable,
      environment: process.env.NODE_ENV || 'production',
      uptime: formatUptime((Date.now() - startupTime) / 1000),
      memoryUsage: memoryString,
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(responsePayload, { status: isHealthy ? 200 : 503 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      database: 'error',
      groq: 'error',
      environment: process.env.NODE_ENV || 'production',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
