const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const dbPath = './databases/NHL_Clutch.db';
const downloadFolder = './downloads';
const graphs = [
    'Goalie_Active_Playoff',
    'Goalie_Active_Playoff_Tied',
    'Goalie_Active_Playoff_Up1',
    'Goalie_Active_Reg',
    'Goalie_Active_Reg_Tied',
    'Goalie_Active_Reg_Up1'
];

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function updateDatabase() {
    const db = new sqlite3.Database(dbPath);

    try {
        for (const table of graphs) {
            const filePath = path.join(downloadFolder, `${table}.csv`);
            if (fs.existsSync(filePath)) {
                console.log(`Updating ${table} from ${filePath}`);
                const rows = await parseCSV(filePath);
                
                rows.forEach((row) => {
                    const columns = Object.keys(row).map((col) => `"${col}"`).join(', ');
                    const placeholders = Object.keys(row).map(() => '?').join(', ');
                    const values = Object.values(row);

                    db.run(`DELETE FROM ${table} WHERE Player = ?`, [row['Player']], (err) => {
                        if (err) console.error(`Error deleting player ${row['Player']} from ${table}:`, err);
                        db.run(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values, (err) => {
                            if (err) console.error(`Error inserting player ${row['Player']} into ${table}:`, err);
                        });
                    });
                });
            } else {
                console.warn(`File not found: ${filePath}`);
            }
        }
    } catch (err) {
        console.error('Error processing CSV files:', err);
    } finally {
        db.close();
        console.log('Database update complete.');
    }
}

updateDatabase();
