import { NextResponse } from 'next/server';
import { isMongoConfigured, readLocalDb } from '@/lib/db-server';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';

export async function GET() {
  try {
    const isMongo = isMongoConfigured();
    
    if (isMongo) {
      try {
        await dbConnect();
        const UserModel = getModelByTable('profiles');
        
        if (UserModel) {
          const profileCount = await UserModel.countDocuments();
          return NextResponse.json({
            status: 'ready',
            mode: 'mongodb',
            message: 'Database connected successfully. MongoDB Atlas is active.',
            profileCount,
          });
        }
      } catch (error: any) {
        return NextResponse.json({
          status: 'error',
          mode: 'mongodb',
          message: 'MongoDB Atlas credentials are set, but connection failed.',
          errorDetails: error.message,
        });
      }
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
