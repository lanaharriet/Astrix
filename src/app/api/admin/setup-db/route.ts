import { NextResponse } from 'next/server';
import { isMongoConfigured, readLocalDb } from '@/lib/db-server';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { logAuditEvent } from '@/lib/audit';
import { trackApiFailure, trackDbFailure } from '@/lib/monitor';
import { getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request) {
  let ip = '127.0.0.1';
  try {
    ip = getClientIp(request);
  } catch (ipErr) {
    // fallback
  }

  try {
    const isMongo = isMongoConfigured();
    
    if (isMongo) {
      try {
        await dbConnect();
        const UserModel = getModelByTable('profiles');
        
        if (UserModel) {
          const profileCount = await UserModel.countDocuments();
          await logAuditEvent('system', 'db_setup_status_check', 'SUCCESS', ip, { mode: 'mongodb', profileCount });
          return NextResponse.json({
            status: 'ready',
            mode: 'mongodb',
            message: 'Database connected successfully. MongoDB Atlas is active.',
            profileCount,
          });
        }
      } catch (error: any) {
        trackDbFailure('setup_db_connect', error);
        await logAuditEvent('system', 'db_setup_status_check', 'FAILED', ip, { mode: 'mongodb', error: error.message });
        return NextResponse.json({
          status: 'error',
          mode: 'mongodb',
          message: 'MongoDB Atlas credentials are set, but connection failed.',
        });
      }
    }

    // Local JSON DB active
    const localDb = readLocalDb();
    const tablesCount = Object.keys(localDb).length;
    
    await logAuditEvent('system', 'db_setup_status_check', 'SUCCESS', ip, { mode: 'local', tablesDetected: tablesCount });
    return NextResponse.json({
      status: 'ready',
      mode: 'local',
      message: 'Running in Local JSON Mode. Data is fully persisted on disk.',
      tablesDetected: tablesCount,
      dbFileLocation: 'src/lib/local-db.json',
    });
  } catch (error: any) {
    trackApiFailure('/api/admin/setup-db', error);
    await logAuditEvent('system', 'db_setup_status_check_unexpected', 'FAILED', ip, { error: error.message });
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 });
  }
}
