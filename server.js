const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


// ======================
// ADD VEHICLE
// ======================
app.post('/addVehicle', (req, res) => {

    console.log("ADD VEHICLE HIT");

    const { owner_name, vehicle_number, vehicle_type } = req.body;

    if (!owner_name || !vehicle_number || !vehicle_type) {
        return res.send("Missing Fields");
    }

    const vehicleSql = `
        INSERT INTO vehicles (owner_name, vehicle_number, vehicle_type)
        VALUES (?, ?, ?)
    `;

    db.query(vehicleSql,
        [owner_name, vehicle_number, vehicle_type],
        (err, vehicleResult) => {

            if (err) {
                console.log(err);
                return res.send('Vehicle Insert Error');
            }

            const vehicle_id = vehicleResult.insertId;

            const slotSql = `
                SELECT * FROM parking_slots
                WHERE current_status='Vacant'
                LIMIT 1
            `;

            db.query(slotSql, (err, slotResult) => {

                if (err) {
                    console.log(err);
                    return res.send('Parking Slot Error');
                }

                if (slotResult.length === 0) {
                    return res.send('No Parking Slot Available');
                }

                const slot_id = slotResult[0].slot_id;
                const slot_number = slotResult[0].slot_number;

                const recordSql = `
                    INSERT INTO parking_records (vehicle_id, slot_id)
                    VALUES (?, ?)
                `;

                db.query(recordSql, [vehicle_id, slot_id], (err) => {

                    if (err) {
                        console.log(err);
                        return res.send('Parking Record Error');
                    }

                    const updateSql = `
                        UPDATE parking_slots
                        SET current_status='Occupied'
                        WHERE slot_id=?
                    `;

                    db.query(updateSql, [slot_id], (err) => {

                        if (err) {
                            console.log(err);
                            return res.send('Slot Update Error');
                        }

                        res.send(`Vehicle Added Successfully. Slot Assigned: ${slot_number}`);
                    });
                });
            });
        });
});


// ======================
// EXIT VEHICLE
// ======================

app.post('/exitVehicle', (req, res) => {

    const { record_id } = req.body;

    const getSlotSql = `
        SELECT slot_id FROM parking_records WHERE record_id=?
    `;

    db.query(getSlotSql, [record_id], (err, result) => {

        if (err) return res.send('Record Error');

        if (result.length === 0) {
            return res.send('Record Not Found');
        }

        const slot_id = result[0].slot_id;

        // STEP 1: DELETE RECORD
        const deleteSql = `
            DELETE FROM parking_records WHERE record_id=?
        `;

        db.query(deleteSql, [record_id], (err) => {

            if (err) return res.send('Delete Error');

            // STEP 2: FREE SLOT
            const freeSlotSql = `
                UPDATE parking_slots
                SET current_status='Vacant'
                WHERE slot_id=?
            `;

            db.query(freeSlotSql, [slot_id], (err) => {

                if (err) return res.send('Slot Free Error');

                res.send('Vehicle Record Deleted & Slot Freed');
            });
        });
    });
});

// ======================
// GET VEHICLES
// ======================
app.get('/vehicles', (req, res) => {
    db.query('SELECT * FROM vehicles', (err, result) => {
        if (err) return res.send('Error Fetching Vehicles');
        res.json(result);
    });
});


// ======================
// GET PARKING RECORDS
// ======================
app.get('/parkingRecords', (req, res) => {

    const sql = `
        SELECT
        parking_records.record_id,
        vehicles.owner_name,
        vehicles.vehicle_number,
        parking_slots.slot_number,
        parking_records.entry_time,
        parking_records.record_status
        FROM parking_records
        JOIN vehicles ON parking_records.vehicle_id = vehicles.vehicle_id
        JOIN parking_slots ON parking_records.slot_id = parking_slots.slot_id
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.send('Error Fetching Records');
        }
        res.json(result);
    });
});


// ======================
// START SERVER
// ======================
app.listen(3000, () => {
    console.log('Server Running on Port 3000');
});