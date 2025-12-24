/**
 * Script to check event dept codes against the event ID mappings
 * Fetches all events from DB and compares their dept field with what
 * the JSON mapping says it should be based on the ins_id.
 *
 * READ ONLY - Does not modify any data in the database.
 *
 * Usage:
 *   node scripts/fix-event-dept.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env manually
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments (# or ;) and empty lines
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith(';')) {
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmed.slice(0, eqIndex).trim();
                const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        }
    }
}

loadEnv();

// Load the event ID mappings from JSON
function loadEventIdMappings() {
    const jsonPath = path.join(__dirname, '..', 'public', 'data', 'updatedEEventId.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(jsonContent);
}

// Build a reverse lookup from event ID code to department info
// New JSON structure: each entry has { code: "XX", template: "..." }
function buildReverseLookup(mappings) {
    const lookup = {};

    // Process campuses (Campus 1 and Campus 2)
    for (const [campusName, departments] of Object.entries(mappings.campuses)) {
        for (const [deptName, deptInfo] of Object.entries(departments)) {
            // New structure: deptInfo = { code: "AI", template: "SECC126MMDAIYY" }
            // Extract the event ID code from template (e.g., "AI" from "SECC126MMDAIYY")
            const codeMatch = deptInfo.template.match(/MMD(.+?)YY$/);
            if (codeMatch) {
                const eventIdCode = codeMatch[1]; // Code in event ID (e.g., "AI")
                lookup[eventIdCode] = {
                    name: deptName,
                    shortCode: deptInfo.code, // Short code stored in DB (e.g., "AI")
                    category: 'Academic Department',
                    campus: campusName,
                    template: deptInfo.template
                };
            }
        }
    }

    // Process non-academic departments
    for (const [deptName, deptInfo] of Object.entries(mappings.non_academic_departments)) {
        const codeMatch = deptInfo.template.match(/MM(.+?)YY$/);
        if (codeMatch) {
            const eventIdCode = codeMatch[1];
            lookup[eventIdCode] = {
                name: deptName,
                shortCode: deptInfo.code,
                category: 'Non-Academic Department',
                template: deptInfo.template
            };
        }
    }

    // Process other entities
    for (const [entityName, entityInfo] of Object.entries(mappings.other)) {
        const codeMatch = entityInfo.template.match(/MM(.+?)YY$/);
        if (codeMatch) {
            const eventIdCode = codeMatch[1];
            lookup[eventIdCode] = {
                name: entityName,
                shortCode: entityInfo.code,
                category: 'Other Entity',
                template: entityInfo.template
            };
        }
    }

    // Process clubs & cells
    for (const [clubName, clubInfo] of Object.entries(mappings.clubs_cells)) {
        const codeMatch = clubInfo.template.match(/MM(.+?)YY$/);
        if (codeMatch) {
            const eventIdCode = codeMatch[1];
            lookup[eventIdCode] = {
                name: clubName,
                shortCode: clubInfo.code,
                category: 'Club/Cell',
                template: clubInfo.template
            };
        }
    }

    // Process professional societies
    for (const [societyName, societyInfo] of Object.entries(mappings.professional_societies)) {
        const codeMatch = societyInfo.template.match(/MM(.+?)YY$/);
        if (codeMatch) {
            const eventIdCode = codeMatch[1];
            lookup[eventIdCode] = {
                name: societyName,
                shortCode: societyInfo.code,
                category: 'Professional Society',
                template: societyInfo.template
            };
        }
    }

    // Process IEEE societies
    if (mappings.ieee_societies) {
        for (const [societyName, societyInfo] of Object.entries(mappings.ieee_societies)) {
            const codeMatch = societyInfo.template.match(/MM(.+?)YY$/);
            if (codeMatch) {
                const eventIdCode = codeMatch[1];
                lookup[eventIdCode] = {
                    name: societyName,
                    shortCode: societyInfo.code,
                    category: 'IEEE Society',
                    template: societyInfo.template
                };
            }
        }
    }

    return lookup;
}

/**
 * Extract the entity code from an event ID (ins_id)
 * 
 * Event ID Format Examples:
 * - SEC202501CAM01 -> CAM (Automobile Club)
 * - SEC202501DEC01 -> EC (after removing D prefix for departments)
 * - SECC126MMDAIYY format becomes SEC202501DAI01 in actual use
 * 
 * Format: CLG(3) + YEAR(4) + MM(2) + CODE(variable) + SEQ(2)
 */
function extractEntityCodeFromInsId(insId) {
    if (!insId) return null;

    // Handle compound IDs like "SIT202501DEI01 / SEC202501DEI01"
    const firstId = insId.split(' / ')[0].trim();

    // Remove: CLG(3) + YEAR(4) + MM(2) = 9 chars from start
    // Remove: SEQ(2) from end
    const entityCode = firstId.slice(9, -2);

    return entityCode;
}

/**
 * Determine the correct department SHORT CODE based on the entity code
 * using the reverse lookup from the JSON mappings
 * Returns the shortCode that should be stored in DB
 */
function getCorrectDeptFromCode(entityCode, reverseLookup) {
    if (!entityCode) return { correctDept: null, category: 'Unknown', found: false };

    // Check if the code starts with 'D' (department prefix in event IDs)
    // e.g., DEC -> EC, DCS -> CS
    if (entityCode.startsWith('D') && entityCode.length >= 3) {
        const deptCode = entityCode.slice(1); // Remove 'D' prefix
        if (reverseLookup[deptCode]) {
            return {
                correctDept: reverseLookup[deptCode].shortCode, // Use shortCode for DB comparison
                name: reverseLookup[deptCode].name,
                category: reverseLookup[deptCode].category,
                campus: reverseLookup[deptCode].campus,
                found: true
            };
        }
    }

    // Check direct match (for clubs, societies, etc.)
    if (reverseLookup[entityCode]) {
        return {
            correctDept: reverseLookup[entityCode].shortCode, // Use shortCode for DB comparison
            name: reverseLookup[entityCode].name,
            category: reverseLookup[entityCode].category,
            found: true
        };
    }

    // Not found in mappings
    return { correctDept: entityCode, category: 'Unknown', found: false };
}

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI not found in environment');
        process.exit(1);
    }

    console.log('Loading event ID mappings from updatedEEventId.json...');
    const mappings = loadEventIdMappings();
    const reverseLookup = buildReverseLookup(mappings);
    console.log(`Loaded ${Object.keys(reverseLookup).length} mappings\n`);

    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log('Connected to MongoDB (READ ONLY)\n');

        const db = client.db();
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');
        const departmentsCollection = db.collection('departments');
        const societiesCollection = db.collection('societies');

        // Fetch all clubs, departments, and societies to build valid codes lookup
        const clubs = await clubsCollection.find({}).toArray();
        const departments = await departmentsCollection.find({}).toArray();
        const societies = await societiesCollection.find({}).toArray();

        console.log(`Found ${clubs.length} clubs, ${departments.length} departments, and ${societies.length} societies in DB`);

        // Build a lookup of valid codes that exist in the DB
        const validCodes = new Map();

        clubs.forEach(club => {
            validCodes.set(club.code, {
                type: 'Club',
                name: club.name,
                code: club.code
            });
        });

        departments.forEach(dept => {
            validCodes.set(dept.code, {
                type: 'Department',
                name: dept.name,
                code: dept.code,
                college: dept.college
            });
        });

        societies.forEach(society => {
            validCodes.set(society.code, {
                type: 'Society',
                name: society.name,
                code: society.code,
                societyType: society.type
            });
        });

        console.log(`Valid codes in DB: ${validCodes.size}\n`);

        // Find all events with an ins_id
        const events = await eventsCollection
            .find({
                ins_id: { $ne: null, $exists: true },
            })
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`Found ${events.length} events with ins_id`);

        // Process all events and categorize them
        const matches = [];
        const mismatches = [];
        const unknowns = [];

        events.forEach((event) => {
            const insId = event.ins_id;
            const currentDept = event.dept || '';
            const entityCode = extractEntityCodeFromInsId(insId);
            const { correctDept, name, category, campus, found } = getCorrectDeptFromCode(entityCode, reverseLookup);
            const isMatch = currentDept === correctDept;

            // Check if the expected dept code exists in DB
            const expectedCodeInfo = validCodes.get(correctDept);
            const expectedCodeExistsInDB = !!expectedCodeInfo;

            const eventData = {
                insId,
                entityCode,
                currentDept,
                correctDept,
                correctDeptName: name,
                category,
                campus,
                eventName: event.eventData?.EventName || 'Unknown',
                found,
                isMatch,
                expectedCodeExistsInDB,
                expectedCodeType: expectedCodeInfo?.type || null,
                expectedCodeDBName: expectedCodeInfo?.name || null
            };

            if (!found) {
                unknowns.push(eventData);
            } else if (isMatch) {
                matches.push(eventData);
            } else {
                mismatches.push(eventData);
            }
        });

        // Print sorted results: Matches first, then Unknowns, then Mismatches
        console.log('='.repeat(150));
        console.log('RESULTS SORTED BY MATCH STATUS');
        console.log('='.repeat(150));
        console.log(
            'No'.padEnd(5) +
            'ins_id'.padEnd(28) +
            'Entity Code'.padEnd(14) +
            'Current Dept (DB)'.padEnd(35) +
            'Expected Dept (JSON)'.padEnd(45) +
            'Category'.padEnd(22) +
            'Status'
        );
        console.log('-'.repeat(150));

        let rowNum = 0;

        // Print Matches
        if (matches.length > 0) {
            console.log('\n--- ✅ MATCHES (' + matches.length + ') ---');
            matches.forEach((e) => {
                rowNum++;
                const campusInfo = e.campus ? ` (${e.campus})` : '';
                console.log(
                    String(rowNum).padEnd(5) +
                    (e.insId || '').slice(0, 26).padEnd(28) +
                    (e.entityCode || '').padEnd(14) +
                    e.currentDept.slice(0, 33).padEnd(35) +
                    ((e.correctDept || '???') + campusInfo).slice(0, 43).padEnd(45) +
                    e.category.padEnd(22) +
                    '✅ MATCH'
                );
            });
        }

        // Print Unknowns
        if (unknowns.length > 0) {
            console.log('\n--- ❓ UNKNOWN CODES (' + unknowns.length + ') ---');
            unknowns.forEach((e) => {
                rowNum++;
                console.log(
                    String(rowNum).padEnd(5) +
                    (e.insId || '').slice(0, 26).padEnd(28) +
                    (e.entityCode || '').padEnd(14) +
                    e.currentDept.slice(0, 33).padEnd(35) +
                    (e.correctDept || '???').slice(0, 43).padEnd(45) +
                    e.category.padEnd(22) +
                    '❓ UNKNOWN'
                );
            });
        }

        // Print Mismatches
        if (mismatches.length > 0) {
            console.log('\n--- ❌ MISMATCHES (' + mismatches.length + ') ---');
            mismatches.forEach((e) => {
                rowNum++;
                const campusInfo = e.campus ? ` (${e.campus})` : '';
                console.log(
                    String(rowNum).padEnd(5) +
                    (e.insId || '').slice(0, 26).padEnd(28) +
                    (e.entityCode || '').padEnd(14) +
                    e.currentDept.slice(0, 33).padEnd(35) +
                    ((e.correctDept || '???') + campusInfo).slice(0, 43).padEnd(45) +
                    e.category.padEnd(22) +
                    '❌ MISMATCH'
                );
            });
        }

        console.log('\n' + '='.repeat(150));
        console.log('SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total events with ins_id: ${events.length}`);
        console.log(`✅ Matching: ${matches.length}`);
        console.log(`❌ Mismatches: ${mismatches.length}`);
        console.log(`❓ Unknown codes: ${unknowns.length}`);

        if (mismatches.length > 0) {
            console.log('\n' + '='.repeat(150));
            console.log('MISMATCHES DETAIL (Events that need dept correction)');
            console.log('='.repeat(150));

            // Count how many can be fixed (expected code exists in DB)
            const fixable = mismatches.filter(m => m.expectedCodeExistsInDB).length;
            console.log(`\n⚠️  ${fixable} of ${mismatches.length} mismatches can be fixed (expected code exists in DB)\n`);

            mismatches.forEach((m, i) => {
                console.log(`\n${i + 1}. Event ID: ${m.insId}`);
                console.log(`   Event Name: ${m.eventName}`);
                console.log(`   Entity Code: ${m.entityCode}`);
                console.log(`   Current Dept (DB): "${m.currentDept}"`);
                console.log(`   Expected Dept (JSON): "${m.correctDept}"${m.campus ? ` (${m.campus})` : ''}`);
                console.log(`   Category: ${m.category}`);

                // Show if the expected code exists in DB
                if (m.expectedCodeExistsInDB) {
                    console.log(`   ✅ CAN FIX: Expected code "${m.correctDept}" exists in DB as ${m.expectedCodeType} (${m.expectedCodeDBName})`);
                } else {
                    console.log(`   ❌ CANNOT FIX: Expected code "${m.correctDept}" does NOT exist in DB clubs/departments`);
                }
            });

            // Ask user if they want to fix the mismatches
            const fixableEvents = mismatches.filter(m => m.expectedCodeExistsInDB);
            if (fixableEvents.length > 0) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise(resolve => {
                    rl.question(`\n🔧 Do you want to fix ${fixableEvents.length} events? (yes/no): `, resolve);
                });
                rl.close();

                if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                    console.log('\n' + '='.repeat(80));
                    console.log('FIXING EVENTS...');
                    console.log('='.repeat(80));

                    let fixed = 0;
                    let failed = 0;

                    for (const m of fixableEvents) {
                        try {
                            // Find the event by ins_id and update its dept
                            const result = await eventsCollection.updateMany(
                                { ins_id: m.insId.split(' / ')[0].trim() },
                                { $set: { dept: m.correctDept } }
                            );

                            if (result.modifiedCount > 0) {
                                console.log(`✅ Fixed: ${m.insId} -> dept: "${m.correctDept}"`);
                                fixed += result.modifiedCount;
                            } else {
                                console.log(`⏭️  No change: ${m.insId}`);
                            }
                        } catch (err) {
                            console.log(`❌ Failed: ${m.insId} - ${err.message}`);
                            failed++;
                        }
                    }

                    console.log('\n' + '='.repeat(50));
                    console.log('FIX SUMMARY');
                    console.log('='.repeat(50));
                    console.log(`✅ Fixed: ${fixed} events`);
                    console.log(`❌ Failed: ${failed} events`);
                } else {
                    console.log('\n⏹️  Fix cancelled by user.');
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

main();
