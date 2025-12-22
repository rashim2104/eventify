/**
 * Script to extract dept codes from ins_id for all events
 * Run this first to verify the mappings before applying fixes.
 *
 * Usage:
 *   node scripts/fix-event-dept.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    }
}

loadEnv();

/**
 * Extract the entity code from an event ID (ins_id)
 * Format: CLG(3) + YEAR(4) + MM(2) + CODE(variable) + SEQ(2)
 * 
 * Examples:
 * - SEC202501DEC01 -> DEC (Department ECE)
 * - SEC202504IEEESPS01 -> IEEESPS (IEEE Signal Processing)
 * - SEC202503CLE01 -> CLE (Club - Leo)
 * - SEC202504NSS05 -> NSS
 */
function extractEntityFromInsId(insId) {
    if (!insId) return null;

    // Handle compound IDs like "SIT202501DEI01 / SEC202501DEI01"
    const firstId = insId.split(' / ')[0].trim();

    // Remove: CLG(3) + YEAR(4) + MM(2) = 9 chars from start
    // Remove: SEQ(2) from end
    const entityCode = firstId.slice(9, -2);

    return entityCode;
}

/**
 * Derive the correct dept code from the extracted entity
 * Returns { correctDept, entityType }
 */
function deriveCorrectDept(entityCode) {
    if (!entityCode) return { correctDept: null, entityType: 'Unknown' };

    // Special department code mappings (event ID code -> actual dept code)
    const deptCodeMappings = {
        'PY': 'PH',  // Physics
        'TA': 'TA',  // Training & Placement
    };

    // Department pattern: D + 2-char code (e.g., DEC -> EC, DPY -> PH)
    if (entityCode.startsWith('D') && entityCode.length === 3) {
        const rawDept = entityCode.slice(1); // Remove 'D' prefix
        const correctDept = deptCodeMappings[rawDept] || rawDept;
        return { correctDept, entityType: 'Department' };
    }

    // IEEE Society: starts with IEEE
    if (entityCode.startsWith('IEEE')) {
        return { correctDept: entityCode, entityType: 'IEEE Society' };
    }

    // MBA special case
    if (entityCode === 'MBA') {
        return { correctDept: 'MB', entityType: 'Department (MBA)' };
    }

    // MAT -> MA (Mathematics)
    if (entityCode === 'MAT') {
        return { correctDept: 'MA', entityType: 'Department (Math)' };
    }

    // Club pattern: C + 2-char code (e.g., CLE, CTC, CMA)
    if (entityCode.startsWith('C') && entityCode.length === 3) {
        return { correctDept: entityCode, entityType: 'Club' };
    }

    // Professional Society: S + 2-char code
    if (entityCode.startsWith('S') && entityCode.length === 3) {
        return { correctDept: entityCode, entityType: 'Prof Society' };
    }

    // Known standalone entities with their correct dept codes
    const standaloneEntities = {
        'NSS': 'NSS',
        'NCC': 'NCC',
        'YRC': 'YRC',
        'IPR': 'IPR',
        'UBA': 'UBA',
        'BIS': 'BIS',
        'INN': 'INN',
        'IIC': 'IIC',
        'CNL': 'CNL',  // Central Library -> should be OF?
        'PED': 'PED',
        'LIB': 'OF',   // Library -> OF (Office)
        'TAP': 'TAP',
        'OOO': 'OF',   // Other -> OF
        'ATLS': 'ATLS',
        'EST': 'EST',  // EPICS/SIGHT
        'YUC': 'YUC',  // YUVA Club
    };

    if (standaloneEntities[entityCode]) {
        return { correctDept: standaloneEntities[entityCode], entityType: 'Other Entity' };
    }

    // Unknown - return as-is for review
    return { correctDept: entityCode, entityType: 'Unknown' };
}

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI not found in environment');
        process.exit(1);
    }

    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log('Connected to MongoDB\n');

        const db = client.db();
        const eventsCollection = db.collection('events');

        // Find all events with an ins_id
        const events = await eventsCollection
            .find({
                ins_id: { $ne: null, $exists: true },
            })
            .sort({ 'eventData.StartTime': 1 })
            .toArray();

        console.log(`Found ${events.length} events with ins_id`);
        console.log('Showing only MISMATCHED events:\n');
        console.log('='.repeat(140));
        console.log(
            'No'.padEnd(4) +
            'ins_id'.padEnd(32) +
            'Entity Code'.padEnd(16) +
            'Correct Dept'.padEnd(16) +
            'Current Dept'.padEnd(16) +
            'Entity Type'.padEnd(20) +
            'Event Name'
        );
        console.log('='.repeat(140));

        let mismatchCount = 0;

        events.forEach((event, index) => {
            const insId = event.ins_id;
            const currentDept = event.dept || '';
            const entityCode = extractEntityFromInsId(insId);
            const { correctDept, entityType } = deriveCorrectDept(entityCode);
            const isMatch = correctDept === currentDept;

            if (!isMatch) {
                mismatchCount++;
                const eventName = (event.eventData?.EventName || 'Unknown').slice(0, 30);

                console.log(
                    String(mismatchCount).padEnd(4) +
                    insId.slice(0, 30).padEnd(32) +
                    (entityCode || '').padEnd(16) +
                    (correctDept || '???').padEnd(16) +
                    currentDept.padEnd(16) +
                    entityType.padEnd(20) +
                    eventName
                );
            }
        });

        console.log('='.repeat(140));
        console.log(`\nTotal events: ${events.length}`);
        console.log(`Mismatches to fix: ${mismatchCount}`);
        console.log('\nThe "Correct Dept" column shows what the dept should be based on the event ID.');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

main();
