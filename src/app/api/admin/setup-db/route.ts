import { NextResponse } from 'next/server';
import { isSupabaseConfigured, readLocalDb } from '@/lib/db-server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseActive = isSupabaseConfigured();
    
    if (supabaseActive) {
      const supabase = await createClient();
      
      // Perform a test query on the profiles table
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        return NextResponse.json({
          status: 'error',
          mode: 'supabase',
          message: 'Supabase credentials are set, but tables do not exist. Please run schema.sql inside your Supabase SQL Editor.',
          errorDetails: error,
        });
      }
      
      return NextResponse.json({
        status: 'ready',
        mode: 'supabase',
        message: 'Database connected successfully. Supabase is active with all tables.',
      });
    }

    // Local JSON DB active
    const localDb = readLocalDb();
    const tablesCount = Object.keys(localDb).length;
    
    return NextResponse.json({
      status: 'ready',
      mode: 'local',
      message: 'Running in Local JSON Mode. Data is fully persisted on disk.',
      tablesDetected: tablesCount,
      dbFileLocation: 'src/lib/local-db.json',
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
