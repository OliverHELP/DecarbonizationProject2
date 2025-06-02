// --- JAVASCRIPT: Handles the dynamic behavior of the dashboard ---

// DOM Element References
const powerSourcesListEl = document.getElementById('powerSourcesList');
const addPowerSourceBtn = document.getElementById('addPowerSourceBtn');
const newSourceNameInput = document.getElementById('newSourceName');
const newSourceTypeInput = document.getElementById('newSourceType');
const newSourceCapacityInput = document.getElementById('newSourceCapacity');
const newSourceIconInput = document.getElementById('newSourceIcon');
const newSourceCO2Input = document.getElementById('newSourceCO2');
const toggleAddSourceFormBtn = document.getElementById('toggleAddSourceFormBtn');
const addPowerSourceForm = document.getElementById('addPowerSourceForm');

const totalAvailableValueEl = document.getElementById('totalAvailableValue');
const capacityOwlEmojiEl = document.getElementById('capacityOwlEmoji');
const capacityOwlTextEl = document.getElementById('capacityOwlText');
const co2EmissionsValueEl = document.getElementById('co2EmissionsValue');
const simulationModeBtn = document.getElementById('simulationModeBtn');     // Button to toggle simulation mode

const circuitsListEl = document.getElementById('circuitsList');
const addCircuitBtn = document.getElementById('addCircuitBtn');
const newCircuitNameInput = document.getElementById('newCircuitName');
const newCircuitIconInput = document.getElementById('newCircuitIcon'); // NEW
const newCircuitDeviceNameInput = document.getElementById('newCircuitDeviceName');
const newCircuitDeviceWattsInput = document.getElementById('newCircuitDeviceWatts');
const connectToPrimarySourceSelect = document.getElementById('connectToPrimarySource');
const connectToBackupSourceSelect = document.getElementById('connectToBackupSource');
const toggleAddCircuitFormBtn = document.getElementById('toggleAddCircuitFormBtn');
const addCircuitForm = document.getElementById('addCircuitForm');
const totalMeterReadingEl = document.getElementById('totalMeterReading');

const linesContainer = document.getElementById('linesContainer');
const powerAvailablePanel = document.getElementById('powerAvailablePanel');


// --- DATA STORAGE ---
let nextPowerSourceId = 1;
let powerSources = [
    { id: 'ps' + nextPowerSourceId++, name: 'Cogen Unit', isOn: true, capacity: 85000, icon: '⚙️', type: 'Cogen', carbonFootprint: 'Medium', co2gPerkWh: 450 },
    { id: 'ps' + nextPowerSourceId++, name: 'Generator', isOn: false, capacity: 50000, icon: '🔋', type: 'Diesel Gen', carbonFootprint: 'High', co2gPerkWh: 750 },
   
];
let nextCircuitId = 1; // Counter to generate unique IDs for circuits
let circuits = [ // Array of circuit objects
    // Each object represents a circuit/zone with its properties:
    // id: unique identifier
    // name: display name of the zone
    // icon: emoji icon for the zone
    // primarySourceId: ID of the primary power source it's connected to
    // backupSourceId: ID of the backup power source
    // currentSourceId: ID of the source currently powering it (null if offline)
    // devices: array of device objects within this circuit
    //   - devId: unique ID for the device
    //   - name: display name of the device
    //   - icon: emoji icon for the device
    //   - watts: power consumption in Watts
    //   - isOn: boolean, true if device is on, false if off
    // element: (added dynamically) reference to its DOM element
    { id: 'c' + nextCircuitId++, name: 'Lecture hall', icon: '🖥️', primarySourceId: 'ps1', backupSourceId: 'ps2', currentSourceId: null, devices: [ 
        { devId: 'c1-d1', name: 'Lecture utilities ', icon: '🗄️', watts: 1800, isOn: true },
        
    ]},
    { id: 'c' + nextCircuitId++, name: 'Office Lighting', icon: '💡', primarySourceId: 'ps3', backupSourceId: 'ps1', currentSourceId: null, devices: [ 
        { devId: 'c2-d1', name: 'LED Grid', icon: '💡', watts: 3000, isOn: true } 
    ]},
    { id: 'c' + nextCircuitId++, name: 'General Outlets', icon: '🔌', primarySourceId: 'ps3', backupSourceId: 'ps1', currentSourceId: null, devices: [
        { devId: 'c3-d1', name: 'Wall Outlets Floor 1', icon: '🔌', watts: 1500, isOn: true },
        
    ]},
    { id: 'c' + nextCircuitId++, name: 'Elevator System', icon: '↕️', primarySourceId: 'ps1', backupSourceId: 'ps2', currentSourceId: null, devices: [
        { devId: 'c4-d1', name: 'Elevator', icon: '⚙️', watts: 10000, isOn: false },
    
    ]},
    { id: 'c' + nextCircuitId++, name: 'HVAC System', icon: '💨', primarySourceId: 'ps1', backupSourceId: 'ps2', currentSourceId: null, devices: [
        { devId: 'c5-d1', name: 'Main Heat Pump', icon: '🌡️', watts: 12000, isOn: false },
        { devId: 'c5-d2', name: 'Condensers', icon: '🌬️', watts: 2000, isOn: false }
    ]},
    { id: 'c' + nextCircuitId++, name: 'Office Computers', icon: '🔥', primarySourceId: 'ps1', backupSourceId: 'ps2', currentSourceId: null, devices: [
        { devId: 'c6-d1', name: 'Workstations(All)', icon: '🔥', watts: 10000, isOn: true }
    ]},
   
];

// --- FUNCTIONS ---

function setupFormToggles() {
    toggleAddSourceFormBtn.addEventListener('click', () => {
        addPowerSourceForm.classList.toggle('visible');
        toggleAddSourceFormBtn.textContent = addPowerSourceForm.classList.contains('visible') ? 'Hide Add Unit Form' : 'Show Add Unit Form';
    });
    toggleAddCircuitFormBtn.addEventListener('click', () => {
        addCircuitForm.classList.toggle('visible');
        toggleAddCircuitFormBtn.textContent = addCircuitForm.classList.contains('visible') ? 'Hide Add Zone Form' : 'Show Add Zone Form';
    });
}

function populateSourceSelects() {
    connectToPrimarySourceSelect.innerHTML = '<option value="">-- Select Primary --</option>';
    connectToBackupSourceSelect.innerHTML = '<option value="">-- Select Backup (Optional) --</option>';
    powerSources.forEach(source => {
        let optionP = document.createElement('option'); optionP.value = source.id; optionP.textContent = `${source.name} (${source.type})`;
        connectToPrimarySourceSelect.appendChild(optionP);
        let optionB = document.createElement('option'); optionB.value = source.id; optionB.textContent = `${source.name} (${source.type})`;
        connectToBackupSourceSelect.appendChild(optionB);
    });
}

function renderPowerSources() {
    powerSourcesListEl.innerHTML = '';
    powerSources.forEach(source => {
        const sourceDiv = document.createElement('div');
        sourceDiv.className = `block power-source ${source.isOn ? '' : 'off'}`;
        sourceDiv.id = source.id;
        source.element = sourceDiv;

        const iconSpan = document.createElement('span'); iconSpan.className = 'power-source-icon'; iconSpan.textContent = source.icon || '⚡';
        const title = document.createElement('h3'); title.textContent = source.name;
        const capacityP = document.createElement('p'); capacityP.className = 'capacity-info'; capacityP.innerHTML = `Peak Capacity: <strong>${(source.capacity / 1000).toFixed(1)} kW</strong>`;
        const sustainP = document.createElement('p'); sustainP.className = 'sustainability-info'; sustainP.innerHTML = `Type: ${source.type} <br> Carbon: ${source.carbonFootprint || 'N/A'} (${source.co2gPerkWh}g/kWh)`;
        const statusP = document.createElement('p'); statusP.innerHTML = `Status: <strong>${source.isOn ? 'OPERATIONAL' : 'OFFLINE'}</strong>`;
        statusP.style.textAlign = "center"; statusP.style.color = source.isOn ? "var(--color-button-toggle-on)" : "var(--color-button-toggle-off)";
        const toggleBtn = document.createElement('button'); toggleBtn.textContent = source.isOn ? 'Deactivate' : 'Activate';
        toggleBtn.className = `toggle-power ${source.isOn ? 'on' : 'off'}`;
        toggleBtn.onclick = () => togglePowerSource(source.id); toggleBtn.style.cssText = 'display:block; margin:10px auto 5px;';
        const removeBtn = document.createElement('button'); removeBtn.textContent = 'Remove Unit';
        removeBtn.className = 'remove-item'; removeBtn.onclick = () => removePowerSource(source.id); removeBtn.style.cssText = 'display:block; margin:0 auto;';

        sourceDiv.append(iconSpan, title, capacityP, sustainP, statusP, toggleBtn, removeBtn);
        powerSourcesListEl.appendChild(sourceDiv);
    });
    populateSourceSelects();
    renderLines();
    renderTotalPowerAvailable();
}

function addNewPowerSource() {
    const name = newSourceNameInput.value.trim();
    const type = newSourceTypeInput.value.trim() || 'Generic';
    const capacity = parseInt(newSourceCapacityInput.value);
    const icon = newSourceIconInput.value.trim() || '⚡';
    const co2gPerkWh = parseFloat(newSourceCO2Input.value);

    if (!name) { alert('Unit Name is required.'); return; }
    if (isNaN(capacity) || capacity <= 0) { alert('Valid Peak Capacity (Watts) is required.'); return; }
    if (isNaN(co2gPerkWh) || co2gPerkWh < 0) { alert('Valid CO2 g/kWh value is required.'); return; }
    
    let carbonFootprintRating = 'N/A';
    if (co2gPerkWh <= 50) carbonFootprintRating = 'Very Low';
    else if (co2gPerkWh <= 200) carbonFootprintRating = 'Low';
    else if (co2gPerkWh <= 500) carbonFootprintRating = 'Medium';
    else if (co2gPerkWh <= 800) carbonFootprintRating = 'High';
    else carbonFootprintRating = 'Very High';

    powerSources.push({
        id: 'ps' + nextPowerSourceId++, name: name, isOn: false, capacity: capacity, icon: icon,
        type: type, carbonFootprint: carbonFootprintRating, co2gPerkWh: co2gPerkWh
    });
    newSourceNameInput.value = ''; newSourceTypeInput.value = ''; newSourceCapacityInput.value = '';
    newSourceIconInput.value = ''; newSourceCO2Input.value = '';
    renderPowerSources();
    updateCircuitPowerAndDeviceStates();
}
addPowerSourceBtn.addEventListener('click', addNewPowerSource);

function removePowerSource(sourceIdToRemove) {
    if (!confirm('Remove this generation unit? Connected load zones may lose power or switch to backup.')) return;
    powerSources = powerSources.filter(ps => ps.id !== sourceIdToRemove);
    circuits.forEach(circuit => {
        if (circuit.primarySourceId === sourceIdToRemove) circuit.primarySourceId = null;
        if (circuit.backupSourceId === sourceIdToRemove) circuit.backupSourceId = null;
    });
    renderPowerSources(); renderCircuits();
}

function renderTotalPowerAvailable() {
    let totalAvailable = 0;
    powerSources.forEach(source => { if (source.isOn) totalAvailable += source.capacity; });
    totalAvailableValueEl.textContent = `${(totalAvailable / 1000).toFixed(2)} kW`;
    updateCapacityOwl(totalAvailable);
}

function updateCapacityOwl(currentAvailableCapacity) {
    let consumedPower = 0;
    circuits.forEach(circuit => {
        if (circuit.currentSourceId) {
            circuit.devices.forEach(device => {
                if (device.isOn) consumedPower += device.watts;
            });
        }
    });

    let utilization = 0;
    if (currentAvailableCapacity > 0) {
        utilization = (consumedPower / currentAvailableCapacity) * 100;
    } else if (consumedPower > 0) {
        utilization = 101;
    }

    let owlEmoji = '🙂'; let owlText = 'Monitoring...'; let owlTransform = 'scale(1)';
    if (utilization <= 5) {
        owlEmoji = '🙂'; owlText = 'Relaxed';
        if (currentAvailableCapacity === 0 && consumedPower === 0) { owlEmoji = '😴'; owlText = 'System Off';}
    } else if (utilization <= 50) {
        owlEmoji = '😀'; owlText = 'Working Steadily'; owlTransform = 'scale(1.05) translateY(-2px)';
    } else if (utilization <= 90) {
        owlEmoji = '😅'; owlText = 'Working Hard!'; owlTransform = 'scale(1.1) translateY(-4px) rotate(2deg)';
    } else {
        owlEmoji = '🥵'; owlText = utilization > 100 ? 'Overloaded!' : 'Near Max Capacity!';
        owlTransform = 'scale(1.15) translateY(-5px) rotate(-3deg)';
    }
    capacityOwlEmojiEl.textContent = owlEmoji;
    capacityOwlTextEl.textContent = owlText;
    capacityOwlEmojiEl.style.transform = owlTransform;
}

function renderCircuits() {
    circuitsListEl.innerHTML = '';
    circuits.forEach(circuit => {
        const circuitDiv = document.createElement('div');
        circuitDiv.className = 'block circuit'; circuitDiv.id = circuit.id;
        circuit.element = circuitDiv;

        // Create header container for icon and title
        const headerDiv = document.createElement('div');
        headerDiv.className = 'circuit-header';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'circuit-icon';
        iconSpan.textContent = circuit.icon || '🏢'; // Default building emoji if none

        const title = document.createElement('h3');
        title.textContent = circuit.name;

        headerDiv.append(iconSpan, title); // Add icon and title to header

        const connectionP = document.createElement('p'); connectionP.className = 'connection-status';
        const removeBtn = document.createElement('button'); removeBtn.textContent = 'Remove Zone';
        removeBtn.className = 'remove-item'; removeBtn.onclick = () => removeCircuit(circuit.id);
        removeBtn.style.display = 'block'; removeBtn.style.margin = '10px auto 0';

        const devicesContainer = document.createElement('div'); devicesContainer.className = 'circuit-devices';
        circuit.devices.forEach(device => {
            const deviceDiv = document.createElement('div'); deviceDiv.className = 'device'; deviceDiv.dataset.watts = device.watts;
            const iconDiv = document.createElement('div'); iconDiv.className = 'device-icon'; iconDiv.textContent = device.icon || '🔌';
            const deviceNameDiv = document.createElement('div'); deviceNameDiv.className = 'device-name'; deviceNameDiv.textContent = device.name;
            const powerStatsDiv = document.createElement('div'); powerStatsDiv.className = 'device-power-stats'; powerStatsDiv.textContent = `${device.watts}W Load`;
            const switchLabel = document.createElement('label'); switchLabel.className = 'switch';
            const switchInput = document.createElement('input'); switchInput.type = 'checkbox'; switchInput.className = 'device-switch';
            switchInput.checked = device.isOn;
             // Store device and circuit ID on the switch for easier access in simulation mode
            switchInput.dataset.deviceId = device.devId;
            switchInput.dataset.circuitId = circuit.id;

            switchInput.onchange = () => { device.isOn = switchInput.checked; updateCircuitPowerAndDeviceStates(); };
            const sliderSpan = document.createElement('span'); sliderSpan.className = 'slider';
            switchLabel.append(switchInput, sliderSpan);
            deviceDiv.append(iconDiv, deviceNameDiv, powerStatsDiv, switchLabel);
            devicesContainer.appendChild(deviceDiv);
        });
        circuitDiv.append(headerDiv, connectionP, devicesContainer, removeBtn); // Use headerDiv
        circuitsListEl.appendChild(circuitDiv);
    });
    renderLines();
    updateCircuitPowerAndDeviceStates();
}

function renderLines() {
    linesContainer.innerHTML = '';
    if (!powerAvailablePanel) return;
    const availablePanelRect = powerAvailablePanel.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    powerSources.forEach(source => {
        if (!source.element) return;
        const sourceRect = source.element.getBoundingClientRect();
        const line = document.createElement('div');
        line.className = 'flow-line source-to-available-line';
        if (source.isOn) line.classList.add('active');
        linesContainer.appendChild(line);
        const lineHeight = parseFloat(getComputedStyle(line).height);
        const startX = sourceRect.right - bodyRect.left; const startY = sourceRect.top - bodyRect.top + sourceRect.height / 2;
        const endX = availablePanelRect.left - bodyRect.left;
        line.style.left = `${startX - 5}px`; line.style.top = `${startY - (lineHeight / 2)}px`; line.style.width = `${(endX - startX) + 10}px`;
    });

    circuits.forEach(circuit => {
        if (!circuit.element || !circuit.currentSourceId) return;
        const isAnyDeviceOn = circuit.devices.some(d => d.isOn);
        const circuitRect = circuit.element.getBoundingClientRect();
        const line = document.createElement('div');
        line.className = 'flow-line available-to-circuit-line';
        if (circuit.currentSourceId && isAnyDeviceOn) line.classList.add('active');
        linesContainer.appendChild(line);
        const lineHeight = parseFloat(getComputedStyle(line).height);
        const startX = availablePanelRect.right - bodyRect.left;
        const endX = circuitRect.left - bodyRect.left;
        line.style.left = `${startX - 5}px`;
        line.style.top = `${circuitRect.top - bodyRect.top + circuitRect.height / 2 - (lineHeight / 2)}px`;
        line.style.width = `${(endX - startX) + 10}px`;
    });
}

function togglePowerSource(sourceId) {
    const source = powerSources.find(ps => ps.id === sourceId);
    if (source) {
        source.isOn = !source.isOn;
        if(source.element) {
            source.element.classList.toggle('off', !source.isOn);
            const statusP = source.element.querySelector('.sustainability-info + p');
            if (statusP) statusP.innerHTML = `Status: <strong>${source.isOn ? 'OPERATIONAL' : 'OFFLINE'}</strong>`;
            const toggleBtn = source.element.querySelector('.toggle-power');
            if (toggleBtn) {
                toggleBtn.textContent = source.isOn ? 'Deactivate' : 'Activate';
                toggleBtn.classList.toggle('on', source.isOn); toggleBtn.classList.toggle('off', !source.isOn);
            }
        }
        renderTotalPowerAvailable();
        updateCircuitPowerAndDeviceStates();
    }
}

function updateCircuitPowerAndDeviceStates() {
    let totalConsumedWatts = 0;
    circuits.forEach(circuit => {
        let poweringSource = null; let connectionText = 'Offline'; let connectionClass = 'offline';
        const primary = powerSources.find(ps => ps.id === circuit.primarySourceId);
        if (primary && primary.isOn) { poweringSource = primary; connectionText = `Online (Primary: ${primary.name})`; connectionClass = 'primary'; }
        else {
            const backup = powerSources.find(ps => ps.id === circuit.backupSourceId);
            if (backup && backup.isOn) { poweringSource = backup; connectionText = `Online (<strong class="backup">Backup: ${backup.name}</strong>)`; connectionClass = 'backup';}
        }
        circuit.currentSourceId = poweringSource ? poweringSource.id : null;
        const isCircuitActuallyPowered = !!poweringSource;

        if (circuit.element) {
            circuit.element.classList.toggle('powered', isCircuitActuallyPowered);
            const deviceSwitches = circuit.element.querySelectorAll('.device-switch');
            deviceSwitches.forEach(sw => sw.disabled = !isCircuitActuallyPowered);
            const connectionP = circuit.element.querySelector('p.connection-status');
            if (connectionP) connectionP.innerHTML = `Feed Status: <strong class="${connectionClass}">${connectionText}</strong>`;
            if(isCircuitActuallyPowered) { circuit.devices.forEach(device => { if (device.isOn) totalConsumedWatts += device.watts; }); }
        }
    });
    updateTotalPowerConsumption(totalConsumedWatts);
    renderLines();
    calculateAndDisplayCO2Emissions();
}

function updateTotalPowerConsumption(currentConsumption = 0) {
    totalMeterReadingEl.textContent = `${(currentConsumption / 1000).toFixed(2)} kW`;
    let totalAvailable = 0;
    powerSources.forEach(source => { if (source.isOn) totalAvailable += source.capacity; });
    updateCapacityOwl(totalAvailable);
}

function calculateAndDisplayCO2Emissions() {
    let totalCO2gPerHour = 0;
    circuits.forEach(circuit => {
        if (circuit.currentSourceId) {
            const poweringSource = powerSources.find(ps => ps.id === circuit.currentSourceId);
            if (poweringSource && typeof poweringSource.co2gPerkWh === 'number') {
                let circuitLoadWatts = 0;
                circuit.devices.forEach(device => {
                    if (device.isOn) {
                        circuitLoadWatts += device.watts;
                    }
                });
                if (circuitLoadWatts > 0) {
                    const circuitLoadKWh = circuitLoadWatts / 1000.0;
                    totalCO2gPerHour += circuitLoadKWh * poweringSource.co2gPerkWh;
                }
            }
        }
    });
    if (totalCO2gPerHour >= 1000) {
        co2EmissionsValueEl.textContent = `${(totalCO2gPerHour / 1000).toFixed(2)} kg CO₂/hr`;
    } else {
        co2EmissionsValueEl.textContent = `${totalCO2gPerHour.toFixed(1)} g CO₂/hr`;
    }
}

function addNewCircuit() {
    const name = newCircuitNameInput.value.trim();
    const icon = newCircuitIconInput.value.trim() || '🏢'; // Get icon, default 🏢
    const deviceName = newCircuitDeviceNameInput.value.trim() || 'Default Device';
    const deviceWatts = parseInt(newCircuitDeviceWattsInput.value);
    const primaryId = connectToPrimarySourceSelect.value;
    const backupId = connectToBackupSourceSelect.value;

    if (!name) { alert('Zone Name is required.'); return; }
    if (isNaN(deviceWatts) || deviceWatts <= 0) { alert('Valid Initial Device Wattage is required.'); return; }
    if (primaryId && backupId && primaryId === backupId) { alert('Primary and Backup sources cannot be the same.'); return; }
    
    const newDevId = `c${nextCircuitId}-d1`;
    circuits.push({
        id: 'c' + nextCircuitId++,
        name: name,
        icon: icon, // Store icon
        primarySourceId: primaryId || null,
        backupSourceId: backupId || null,
        currentSourceId: null,
        devices: [ { devId: newDevId, name: deviceName, icon: '⚡', watts: deviceWatts, isOn: false } ]
    });
    newCircuitNameInput.value = '';
    newCircuitIconInput.value = ''; // Clear icon input
    newCircuitDeviceNameInput.value = '';
    newCircuitDeviceWattsInput.value = '';
    connectToPrimarySourceSelect.value = '';
    connectToBackupSourceSelect.value = '';
    renderCircuits();
}
addCircuitBtn.addEventListener('click', addNewCircuit);

function removeCircuit(circuitIdToRemove) {
    if (!confirm('Remove this load zone configuration?')) return;
    circuits = circuits.filter(c => c.id !== circuitIdToRemove); renderCircuits();
}

function debounce(func, wait) {
    let timeout; return (...args) => { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); };
}
const debouncedRenderLines = debounce(renderLines, 100);
window.addEventListener('resize', debouncedRenderLines);

   // --- SIMULATION MODE ---
// This section handles the logic for the random simulation mode.

let isSimulationModeActive = false; // Flag to track if simulation is running
let simulationZoneIntervalId = null;  // To store the interval ID for zone simulation
let simulationGeneratorIntervalId = null; // To store the interval ID for generator simulation

const SIMULATION_ZONE_TOGGLE_CHANCE = 0.3; // 30% chance a circuit's devices will be considered for toggling
const SIMULATION_DEVICE_ON_CHANCE = 0.5;   // 50% chance a device (in a chosen circuit) will be turned on
const SIMULATION_GENERATOR_ACTIVE_PROBABILITY = 0.85; // 85% chance a generator will be set to ON

/**
 * Function executed by the zone simulation timer.
 * Randomly toggles the 'isOn' state of devices within circuits.
 */
function simulateZoneChanges() {
    if (!isSimulationModeActive) return; // Do nothing if simulation is off

    console.log("SIM: Simulating zone device changes...");
    circuits.forEach(circuit => {
        // Only consider toggling devices if the circuit itself is currently powered
        // and a random chance passes
        if (circuit.currentSourceId && Math.random() < SIMULATION_ZONE_TOGGLE_CHANCE) {
            circuit.devices.forEach(device => {
                // For each device in the chosen circuit, randomly set its state
                device.isOn = Math.random() < SIMULATION_DEVICE_ON_CHANCE;
            });
        }
    });
    // After changing device states in data, update the entire UI
    // This will re-render switches, update consumption, lines, CO2, owl, etc.
    updateCircuitPowerAndDeviceStates();
}

/**
 * Function executed by the generator simulation timer.
 * Randomly sets the 'isOn' state of power generators.
 */
function simulateGeneratorChanges() {
    if (!isSimulationModeActive) return; // Do nothing if simulation is off

    console.log("SIM: Simulating generator state changes...");
    let changed = false;
    powerSources.forEach(source => {
        // For each source, decide its new state based on the active probability
        const shouldBeOn = Math.random() < SIMULATION_GENERATOR_ACTIVE_PROBABILITY;
        if (source.isOn !== shouldBeOn) {
            source.isOn = shouldBeOn; // Directly update the data model
            changed = true;
        }
    });

    if (changed) {
        // If any generator states were changed in the data:
        // 1. Re-render the power sources panel to show their new visual states (on/off, button text).
        renderPowerSources(); 
        // 2. Update circuits based on these new generator states. This handles everything else:
        //    circuit connection status, device switch enabling/disabling, consumption, lines, CO2, owl.
        updateCircuitPowerAndDeviceStates();
    }
}

/**
 * Toggles the simulation mode on or off.
 * Starts or stops the simulation timers.
 */
function toggleSimulationMode() {
    isSimulationModeActive = !isSimulationModeActive; // Flip the active flag

    if (isSimulationModeActive) {
        console.log("SIM: Simulation Mode STARTED");
        simulationModeBtn.textContent = 'Stop Simulation Mode';
        simulationModeBtn.style.backgroundColor = 'var(--color-button-toggle-off)'; // Red when active

        // Start the zone device simulation timer (every 10 seconds)
        simulationZoneIntervalId = setInterval(simulateZoneChanges, 500);
        // Start the generator state simulation timer (every 30 seconds)
        simulationGeneratorIntervalId = setInterval(simulateGeneratorChanges, 1000);

        // Optionally, run them once immediately
        simulateZoneChanges();
        simulateGeneratorChanges();

    } else {
        console.log("SIM: Simulation Mode STOPPED");
        simulationModeBtn.textContent = 'Start Simulation Mode';
        simulationModeBtn.style.backgroundColor = 'var(--color-button-simulation)'; // Orange when inactive

        // Clear (stop) the simulation timers
        clearInterval(simulationZoneIntervalId);
        clearInterval(simulationGeneratorIntervalId);
        simulationZoneIntervalId = null;
        simulationGeneratorIntervalId = null;
    }
}
// Attach event listener to the simulation mode button
simulationModeBtn.addEventListener('click', toggleSimulationMode);

// --- END SIMULATION MODE ---


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupFormToggles();
    renderPowerSources(); 
    renderCircuits();
});