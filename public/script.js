document.addEventListener('DOMContentLoaded', () => {

    console.log("Frontend Loaded");

    const vehicleForm = document.getElementById('vehicleForm');
    const exitForm = document.getElementById('exitForm');

    // ======================
    // ADD VEHICLE
    // ======================
    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log("Add Vehicle Clicked");

        const owner_name = document.getElementById('owner_name').value;
        const vehicle_number = document.getElementById('vehicle_number').value;
        const vehicle_type = document.getElementById('vehicle_type').value;

        const res = await fetch('/addVehicle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                owner_name,
                vehicle_number,
                vehicle_type
            })
        });

        const data = await res.text();
        document.getElementById('message').innerHTML = data;
    });

    // ======================
    // EXIT VEHICLE
    // ======================
    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log("Exit Vehicle Clicked");

        const record_id = document.getElementById('record_id').value;

        const res = await fetch('/exitVehicle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record_id })
        });

        const data = await res.text();
        document.getElementById('exitMessage').innerHTML = data;
    });

});