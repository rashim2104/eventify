/**
 * Seed Configuration Data Migration Script with Event ID Templates
 * 
 * This script migrates the existing static data into MongoDB collections.
 * 
 * Usage: node scripts/seed-config.js
 * 
 * Make sure MONGODB_URI is set in your environment or .env file
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (!process.env[key.trim()]) {
                process.env[key.trim()] = value;
            }
        }
    });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in environment or .env file');
    process.exit(1);
}

// Define schemas inline
const { Schema, models, model } = mongoose;

const collegeSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
});
const College = models.College || model('College', collegeSchema);

const departmentSchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    college: { type: String, required: true },
    eventIdTemplate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
});
departmentSchema.index({ code: 1, college: 1 }, { unique: true });
const Department = models.Department || model('Department', departmentSchema);

const societySchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['professional', 'ieee'], required: true },
    eventIdTemplate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
});
const Society = models.Society || model('Society', societySchema);

const clubSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    eventIdTemplate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
});
const Club = models.Club || model('Club', clubSchema);

const parentBlockSchema = new Schema({
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
});
const ParentBlock = models.ParentBlock || model('ParentBlock', parentBlockSchema);

// ============ DATA WITH EVENT ID TEMPLATES ============

const collegesData = [
    { code: 'SIT', name: 'Sairam Institute of Technology' },
    { code: 'SEC', name: 'Sairam Engineering College' },
];

const parentBlocksData = [
    { name: 'A Block' }, { name: 'B Block' }, { name: 'C Block' }, { name: 'D Block' },
    { name: 'E Block' }, { name: 'F Block' }, { name: 'G Block' }, { name: 'LMS' },
    { name: 'Sigma' }, { name: 'SIT' },
];

const sitDepartments = [
    { code: 'CS', name: 'CSE', eventIdTemplate: 'CLGYEARMMDCSYY' },
    { code: 'IT', name: 'IT', eventIdTemplate: 'CLGYEARMMDITYY' },
    { code: 'EE', name: 'EEE', eventIdTemplate: 'CLGYEARMMDEEYY' },
    { code: 'EC', name: 'ECE', eventIdTemplate: 'CLGYEARMMDECYY' },
    { code: 'ME', name: 'MECH', eventIdTemplate: 'CLGYEARMMDMEYY' },
    { code: 'SC', name: 'Cyber Security', eventIdTemplate: 'CLGYEARMMDSCYY' },
    { code: 'CO', name: 'CCE', eventIdTemplate: 'CLGYEARMMDCOYY' },
    { code: 'AI', name: 'AI-DS', eventIdTemplate: 'CLGYEARMMDAIYY' },
    { code: 'MB', name: 'MBA', eventIdTemplate: 'CLGYEARMMMBAYY' },
    { code: 'PH', name: 'Physics', eventIdTemplate: 'CLGYEARMMDPYYY' },
    { code: 'EN', name: 'English', eventIdTemplate: 'CLGYEARMMDENYY' },
    { code: 'MA', name: 'Maths', eventIdTemplate: 'CLGYEARMMDMAYY' },
    { code: 'CH', name: 'Chemistry', eventIdTemplate: 'CLGYEARMMDCHYY' },
    { code: 'PD', name: 'Physical Education', eventIdTemplate: 'CLGYEARMMPEDYY' },
    { code: 'TA', name: 'Tamil' },
    { code: 'SBIT', name: 'IEEE Student Branch', eventIdTemplate: 'CLGYEARMMESBYY' },
];

const secDepartments = [
    { code: 'AI', name: 'AI-DS', eventIdTemplate: 'CLGYEARMMDAIYY' },
    { code: 'AM', name: 'AI-ML', eventIdTemplate: 'CLGYEARMMDAMYY' },
    { code: 'CB', name: 'CSBS', eventIdTemplate: 'CLGYEARMMDCBYY' },
    { code: 'CS', name: 'CSE', eventIdTemplate: 'CLGYEARMMDCSYY' },
    { code: 'EE', name: 'EEE', eventIdTemplate: 'CLGYEARMMDEEYY' },
    { code: 'EC', name: 'ECE', eventIdTemplate: 'CLGYEARMMDECYY' },
    { code: 'EI', name: 'E&I', eventIdTemplate: 'CLGYEARMMDEIYY' },
    { code: 'ME', name: 'MECH', eventIdTemplate: 'CLGYEARMMDMEYY' },
    { code: 'CE', name: 'CIVIL', eventIdTemplate: 'CLGYEARMMDCEYY' },
    { code: 'IT', name: 'IT', eventIdTemplate: 'CLGYEARMMDITYY' },
    { code: 'IC', name: 'ICE', eventIdTemplate: 'CLGYEARMMDICYY' },
    { code: 'CI', name: 'IOT', eventIdTemplate: 'CLGYEARMMDCIYY' },
    { code: 'MB', name: 'MBA', eventIdTemplate: 'CLGYEARMMMBAYY' },
    { code: 'CJ', name: 'M.Tech CSE', eventIdTemplate: 'CLGYEARMMDCJYY' },
    { code: 'MU', name: 'Mech & Auto', eventIdTemplate: 'CLGYEARMMDMUYY' },
    { code: 'PH', name: 'Physics', eventIdTemplate: 'CLGYEARMMDPYYY' },
    { code: 'EN', name: 'English', eventIdTemplate: 'CLGYEARMMDENYY' },
    { code: 'MA', name: 'Maths', eventIdTemplate: 'CLGYEARMMDMAYY' },
    { code: 'CH', name: 'Chemistry', eventIdTemplate: 'CLGYEARMMDCHYY' },
    { code: 'PD', name: 'Physical Education', eventIdTemplate: 'CLGYEARMMPEDYY' },
    { code: 'TA', name: 'Tamil' },
    { code: 'SBEC', name: 'IEEE Student Branch', eventIdTemplate: 'CLGYEARMMESBYY' },
];

// Professional societies with templates
const professionalSocieties = [
    { code: 'ISTE', name: 'Indian society for Technical Education (ISTE)', eventIdTemplate: 'CLGYEARMMSTEYY' },
    { code: 'IEI', name: 'Institution of Engineers (India)', eventIdTemplate: 'CLGYEARMMSIEYY' },
    { code: 'CSI', name: 'Computer Society of India (CSI)', eventIdTemplate: 'CLGYEARMMSCSYY' },
    { code: 'SAE', name: 'SAE' },
    { code: 'BIS', name: 'BIS', eventIdTemplate: 'CLGYEARMMBISYY' },
    { code: 'IEEE', name: 'IEEE' },
    { code: 'IETE', name: 'IETE' },
    { code: 'ICI', name: 'Indian Concrete Institute(ICI)', eventIdTemplate: 'CLGYEARMMSICYY' },
    { code: 'IIC', name: 'Institution Innovation Council', eventIdTemplate: 'CLGYEARMMIICYY' },
    { code: 'ITS', name: 'Information Theory Society (ITS)', eventIdTemplate: 'CLGYEARMMSITYY' },
    { code: 'IGB', name: 'Indian Green Building Council (IGB)', eventIdTemplate: 'CLGYEARMMSGBYY' },
    { code: 'MTS', name: 'Marine Technology (MTS)', eventIdTemplate: 'CLGYEARMMSMTYY' },
    { code: 'ISHRAE', name: 'ISHRAE', eventIdTemplate: 'CLGYEARMMSHRYY' },
    { code: 'IWS', name: 'Indian Welding Society (IWS)', eventIdTemplate: 'CLGYEARMMSIWYY' },
    { code: 'ASI', name: 'Analytics society of India (ASI)', eventIdTemplate: 'CLGYEARMMSASYY' },
    { code: 'MMA', name: 'Madras Management Associations (MMA)', eventIdTemplate: 'CLGYEARMMSMAYY' },
    { code: 'AIMS', name: 'Associations of Indian Management Schools (AIMS)', eventIdTemplate: 'CLGYEARMMSIMYY' },
];

// IEEE societies with templates
const ieeeSocieties = [
    { code: 'Computer Society', name: 'Computer Society', eventIdTemplate: 'CLGYEARMMECSYY' },
    { code: 'Communications Society', name: 'Communications Society', eventIdTemplate: 'CLGYEARMMECMYY' },
    { code: 'Signal Processing Society', name: 'Signal Processing Society', eventIdTemplate: 'CLGYEARMMESPYY' },
    { code: 'Power & Energy Society', name: 'Power & Energy Society', eventIdTemplate: 'CLGYEARMMEPEYY' },
    { code: 'Robotics and Automation Society', name: 'Robotics and Automation Society', eventIdTemplate: 'CLGYEARMMERAYY' },
    { code: 'Control Systems Society', name: 'Control Systems Society', eventIdTemplate: 'CLGYEARMMECOYY' },
    { code: 'Industry Applications Society', name: 'Industry Applications Society', eventIdTemplate: 'CLGYEARMMEIAYY' },
    { code: 'Electron Devices Society', name: 'Electron Devices Society', eventIdTemplate: 'CLGYEARMMEEDYY' },
    { code: 'Circuits and Systems Society', name: 'Circuits and Systems Society', eventIdTemplate: 'CLGYEARMMECRYY' },
    { code: 'Engineering in Medicine and Biology Society', name: 'Engineering in Medicine and Biology Society', eventIdTemplate: 'CLGYEARMMEMBYY' },
    { code: 'Photonics Society', name: 'Photonics Society', eventIdTemplate: 'CLGYEARMMEPSYY' },
    { code: 'Vehicular Technology Society', name: 'Vehicular Technology Society', eventIdTemplate: 'CLGYEARMMEVTYY' },
    { code: 'Aerospace and Electronic Systems Society', name: 'Aerospace and Electronic Systems Society', eventIdTemplate: 'CLGYEARMMEAEYY' },
    { code: 'Education Society', name: 'Education Society', eventIdTemplate: 'CLGYEARMMEESYY' },
    { code: 'Women in Engineering', name: 'Women in Engineering', eventIdTemplate: 'CLGYEARMMEWEYY' },
    { code: 'SIGHT', name: 'SIGHT', eventIdTemplate: 'CLGYEARMMESTYY' },
    { code: 'Student Branch', name: 'Student Branch' },
];

// Clubs with event ID templates
const clubs = [
    { code: 'Technoculture Club', name: 'Technoculture Club', eventIdTemplate: 'CLGYEARMMCTCYY' },
    { code: 'Automobile Club', name: 'Automobile Club', eventIdTemplate: 'CLGYEARMMCAMYY' },
    { code: 'Code Club', name: 'Code Club', eventIdTemplate: 'CLGYEARMMCCDYY' },
    { code: 'Cyber Club', name: 'Cyber Club', eventIdTemplate: 'CLGYEARMMCCYYY' },
    { code: 'Disaster Management & Safety Club', name: 'Disaster Management & Safety Club', eventIdTemplate: 'CLGYEARMMCDSYY' },
    { code: 'Eco and Swacch Bharat', name: 'ECO and Swacch Bharat', eventIdTemplate: 'CLGYEARMMCESYY' },
    { code: 'ENSAV Club', name: 'ENSAV Club', eventIdTemplate: 'CLGYEARMMCENYY' },
    { code: 'English Literary Club', name: 'English Language & Literature club', eventIdTemplate: 'CLGYEARMMCELYY' },
    { code: 'Foreign Language Club', name: 'Foreign Language Club', eventIdTemplate: 'CLGYEARMMCFLYY' },
    { code: 'Fine Arts Association', name: 'Fine arts Association', eventIdTemplate: 'CLGYEARMMCFAYY' },
    { code: 'Health & Yoga Club', name: 'Health & Yoga Club', eventIdTemplate: 'CLGYEARMMCHYYY' },
    { code: 'M-apps Club', name: 'M-apps Club', eventIdTemplate: 'CLGYEARMMCMAYY' },
    { code: 'Maths Club', name: 'Maths Club', eventIdTemplate: 'CLGYEARMMCMTYY' },
    { code: 'Photography Club', name: 'Photography Club', eventIdTemplate: 'CLGYEARMMCPHYY' },
    { code: 'Robotics Club', name: 'Robotics Club', eventIdTemplate: 'CLGYEARMMCRBYY' },
    { code: 'Rotaract Club', name: 'Rotaract Club', eventIdTemplate: 'CLGYEARMMCRTYY' },
    { code: 'Science club', name: 'Science club', eventIdTemplate: 'CLGYEARMMCSCYY' },
    { code: 'Skill development Club', name: 'Skill development Club', eventIdTemplate: 'CLGYEARMMCSDYY' },
    { code: 'Sai Muthamizh Mandram', name: 'Sai Muthamizh Mandram', eventIdTemplate: 'CLGYEARMMCMMYY' },
    { code: 'Young Indians Club', name: 'Young Indians Club(YUVA)', eventIdTemplate: 'CLGYEARMMCYUYY' },
    { code: 'Red Ribbon Club', name: 'Red Ribbon Club', eventIdTemplate: 'CLGYEARMMCRRYY' },
    { code: 'Game Development Club', name: 'Game Development Club', eventIdTemplate: 'CLGYEARMMCGDYY' },
    { code: 'Artificial Intelligence and Machine Learning Club', name: 'Artificial Intelligence and Machine Learning Club', eventIdTemplate: 'CLGYEARMMCMLYY' },
    { code: 'Entrepreneurship Cell', name: 'Entrepreneurship Cell', eventIdTemplate: 'CLGYEARMMCECYY' },
    { code: 'Higher Education Cell', name: 'Higher Education Cell', eventIdTemplate: 'CLGYEARMMCHEYY' },
    { code: 'NCC', name: 'NCC', eventIdTemplate: 'CLGYEARMMNCCYY' },
    { code: 'NSS', name: 'NSS', eventIdTemplate: 'CLGYEARMMNSSYY' },
    { code: 'Wowww', name: 'Women Empowerment Cell (WOWWW)', eventIdTemplate: 'CLGYEARMMCWEYY' },
    { code: 'YRC', name: 'YRC', eventIdTemplate: 'CLGYEARMMYRCYY' },
    { code: 'IPR', name: 'IPR', eventIdTemplate: 'CLGYEARMMIPRYY' },
    { code: 'GDSC', name: 'Google Developer club', eventIdTemplate: 'CLGYEARMMCGOYY' },
    { code: 'UBA', name: 'UBA', eventIdTemplate: 'CLGYEARMMUBAYY' },
    { code: 'BIS', name: 'BIS', eventIdTemplate: 'CLGYEARMMBISYY' },
    { code: 'Library', name: 'Library', eventIdTemplate: 'CLGYEARMMLIBYY' },
    { code: 'Placement', name: 'Placement', eventIdTemplate: 'CLGYEARMMTAPYY' },
    { code: 'Innovation', name: 'Innovation', eventIdTemplate: 'CLGYEARMMINNYY' },
];

// ============ SEED FUNCTIONS ============

async function seedColleges() {
    console.log('Seeding colleges...');
    for (const c of collegesData) {
        await College.findOneAndUpdate({ code: c.code }, c, { upsert: true });
        console.log(`  ✓ ${c.code}`);
    }
}

async function seedParentBlocks() {
    console.log('Seeding parent blocks...');
    for (const b of parentBlocksData) {
        await ParentBlock.findOneAndUpdate({ name: b.name }, b, { upsert: true });
        console.log(`  ✓ ${b.name}`);
    }
}

async function seedDepartments() {
    console.log('Seeding SIT departments...');
    for (const d of sitDepartments) {
        await Department.findOneAndUpdate({ code: d.code, college: 'SIT' }, { ...d, college: 'SIT' }, { upsert: true });
        console.log(`  ✓ SIT-${d.code}`);
    }
    console.log('Seeding SEC departments...');
    for (const d of secDepartments) {
        await Department.findOneAndUpdate({ code: d.code, college: 'SEC' }, { ...d, college: 'SEC' }, { upsert: true });
        console.log(`  ✓ SEC-${d.code}`);
    }
}

async function seedSocieties() {
    console.log('Seeding professional societies...');
    for (const s of professionalSocieties) {
        await Society.findOneAndUpdate({ code: s.code }, { ...s, type: 'professional' }, { upsert: true });
        console.log(`  ✓ ${s.code}`);
    }
    console.log('Seeding IEEE societies...');
    for (const s of ieeeSocieties) {
        await Society.findOneAndUpdate({ code: s.code }, { ...s, type: 'ieee' }, { upsert: true });
        console.log(`  ✓ ${s.code.substring(0, 25)}...`);
    }
}

async function seedClubs() {
    console.log('Seeding clubs with event ID templates...');
    for (const c of clubs) {
        await Club.findOneAndUpdate({ code: c.code }, c, { upsert: true });
        console.log(`  ✓ ${c.code.substring(0, 30)} (${c.eventIdTemplate || 'no template'})`);
    }
}

// ============ MAIN ============

async function main() {
    console.log('='.repeat(50));
    console.log('Configuration Data Migration (With Event ID Templates)');
    console.log('='.repeat(50) + '\n');

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!\n');

        await seedColleges();
        await seedParentBlocks();
        await seedDepartments();
        await seedSocieties();
        await seedClubs();

        console.log('\n' + '='.repeat(50));
        console.log('Migration completed with Event ID Templates!');
        console.log('='.repeat(50));
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

main();
