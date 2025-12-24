/**
 * Script to compare DB clubs/societies with JSON mappings and add missing ones
 * 
 * Run: node scripts/add-missing-clubs.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith(';')) {
            const eqIndex = trimmedLine.indexOf('=');
            if (eqIndex !== -1) {
                const key = trimmedLine.substring(0, eqIndex).trim();
                const value = trimmedLine.substring(eqIndex + 1).trim();
                process.env[key] = value;
            }
        }
    });
}

// Load JSON mappings
function loadMappings() {
    const jsonPath = path.join(__dirname, '..', 'public', 'data', 'updatedEEventId.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(jsonContent);
}

async function main() {
    loadEnv();
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
        const clubsCollection = db.collection('clubs');
        const societiesCollection = db.collection('societies');

        // ==========================================
        // FETCH EXISTING FROM DB
        // ==========================================
        const existingClubs = await clubsCollection.find({}).toArray();
        const existingSocieties = await societiesCollection.find({}).toArray();

        const existingClubCodes = new Set(existingClubs.map(c => c.code));
        const existingSocietyCodes = new Set(existingSocieties.map(s => s.code));
        const existingSocietyNames = new Set(existingSocieties.map(s => s.name));

        console.log('='.repeat(60));
        console.log('EXISTING IN DATABASE');
        console.log('='.repeat(60));
        console.log(`\n📁 Clubs (${existingClubs.length}):`);
        existingClubs.forEach(c => console.log(`   - ${c.code}`));

        console.log(`\n🏛️  Societies (${existingSocieties.length}):`);
        existingSocieties.forEach(s => console.log(`   - ${s.code} (${s.type})`));

        // ==========================================
        // LOAD JSON MAPPINGS
        // ==========================================
        const mappings = loadMappings();

        // Extract all expected codes from JSON
        const jsonClubs = [];
        const jsonSocieties = [];

        // clubs_cells -> should be in clubs collection
        if (mappings.clubs_cells) {
            for (const [name, info] of Object.entries(mappings.clubs_cells)) {
                jsonClubs.push({
                    code: info.code,
                    name: name,
                    eventIdTemplate: info.template,
                    isActive: true
                });
            }
        }

        // other -> should be in clubs collection
        if (mappings.other) {
            for (const [name, info] of Object.entries(mappings.other)) {
                jsonClubs.push({
                    code: info.code,
                    name: name,
                    eventIdTemplate: info.template,
                    isActive: true
                });
            }
        }

        // ieee_societies -> should be in societies collection
        if (mappings.ieee_societies) {
            for (const [name, info] of Object.entries(mappings.ieee_societies)) {
                jsonSocieties.push({
                    code: info.code,
                    name: name,
                    type: 'ieee',
                    eventIdTemplate: info.template,
                    isActive: true
                });
            }
        }

        // professional_societies -> should be in societies collection
        if (mappings.professional_societies) {
            for (const [name, info] of Object.entries(mappings.professional_societies)) {
                jsonSocieties.push({
                    code: info.code,
                    name: name,
                    type: 'professional',
                    eventIdTemplate: info.template,
                    isActive: true
                });
            }
        }

        // ==========================================
        // FIND MISSING
        // ==========================================
        const missingClubs = jsonClubs.filter(c => !existingClubCodes.has(c.code));
        // For IEEE societies, compare by code; for professional societies, compare by name
        const missingSocieties = jsonSocieties.filter(s => {
            if (s.type === 'professional') {
                // Professional societies: check by name since DB codes may differ
                return !existingSocietyNames.has(s.name);
            } else {
                // IEEE societies: check by code
                return !existingSocietyCodes.has(s.code);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('COMPARISON WITH updatedEEventId.json');
        console.log('='.repeat(60));

        console.log(`\n📊 JSON has ${jsonClubs.length} clubs, DB has ${existingClubs.length}`);
        console.log(`📊 JSON has ${jsonSocieties.length} societies, DB has ${existingSocieties.length}`);

        console.log('\n' + '='.repeat(60));
        console.log('MISSING IN DATABASE');
        console.log('='.repeat(60));

        if (missingClubs.length === 0 && missingSocieties.length === 0) {
            console.log('\n✅ All clubs and societies from JSON exist in DB!');
            return;
        }

        if (missingClubs.length > 0) {
            console.log(`\n❌ Missing Clubs (${missingClubs.length}):`);
            missingClubs.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.code} (${c.name})`);
            });
        }

        if (missingSocieties.length > 0) {
            console.log(`\n❌ Missing Societies (${missingSocieties.length}):`);
            missingSocieties.forEach((s, i) => {
                console.log(`   ${i + 1}. ${s.code} (${s.name}) [${s.type}]`);
            });
        }

        // ==========================================
        // ASK TO ADD
        // ==========================================
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question(`\n🔧 Do you want to add ${missingClubs.length} clubs and ${missingSocieties.length} societies? (yes/no): `, resolve);
        });
        rl.close();

        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            console.log('\n' + '='.repeat(60));
            console.log('ADDING MISSING ITEMS...');
            console.log('='.repeat(60));

            let clubsAdded = 0;
            let societiesAdded = 0;

            // Add missing clubs
            for (const club of missingClubs) {
                await clubsCollection.insertOne(club);
                console.log(`✅ Added club: ${club.code}`);
                clubsAdded++;
            }

            // Add missing societies
            for (const society of missingSocieties) {
                await societiesCollection.insertOne(society);
                console.log(`✅ Added society: ${society.code}`);
                societiesAdded++;
            }

            console.log('\n' + '='.repeat(60));
            console.log('SUMMARY');
            console.log('='.repeat(60));
            console.log(`✅ Added ${clubsAdded} clubs`);
            console.log(`✅ Added ${societiesAdded} societies`);
        } else {
            console.log('\n⏹️  Operation cancelled.');
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
