/**
 * All-in-One Scientific, Graphing, and Engineering Calculator Engine
 */
class CalculatorEngine {
    constructor() {
        // State variables
        this.isOn = true;
        this.isShift = false;
        this.isHyp = false;
        this.angleUnit = 'DEG'; // DEG, RAD, GRAD
        this.baseMode = 'DEC';  // BIN, OCT, DEC, HEX
        this.memory = 0;
        this.lastAns = 0;
        
        this.currentInput = '0';
        this.expressionHistory = '';
        this.historyLog = [];

        // Graph state
        this.graphOffsetX = 0;
        this.graphOffsetY = 0;

        // Bind UI Elements
        this.initUI();
        this.initConstants();
        this.updateConverterUnits();
        this.initGraphingCanvas();
    }

    initUI() {
        this.lcdMain = document.getElementById('lcdMain');
        this.lcdHistory = document.getElementById('lcdHistory');
        this.shiftIndicator = document.getElementById('shiftIndicator');
        this.hypIndicator = document.getElementById('hypIndicator');
        this.angleIndicator = document.getElementById('angleIndicator');
        this.baseIndicator = document.getElementById('baseIndicator');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.screenSleepOverlay = document.getElementById('screenSleepOverlay');
        this.powerStatus = document.getElementById('powerStatus');

        // Power Toggle Button
        document.getElementById('btnPower').addEventListener('click', () => this.togglePower());

        // SHIFT & HYP Key Listeners
        document.getElementById('btnShift').addEventListener('click', () => this.toggleShift());
        document.getElementById('btnHyp').addEventListener('click', () => this.toggleHyp());

        // Tools Drawer Listeners
        document.getElementById('btnToolsToggle').addEventListener('click', () => this.openToolsModal());
        document.getElementById('btnMode').addEventListener('click', () => this.openToolsModal());

        // Theme Toggle Listener
        document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());

        this.renderLCD();
    }

    togglePower() {
        this.isOn = !this.isOn;
        if (!this.isOn) {
            this.screenSleepOverlay.classList.remove('hidden');
            this.screenSleepOverlay.classList.add('flex');
            this.powerStatus.innerText = 'OFF';
        } else {
            this.screenSleepOverlay.classList.add('hidden');
            this.screenSleepOverlay.classList.remove('flex');
            this.powerStatus.innerText = '● READY';
            this.renderLCD();
        }
    }

    toggleShift() {
        if (!this.isOn) return;
        this.isShift = !this.isShift;
        this.shiftIndicator.style.opacity = this.isShift ? '1' : '0.2';
        
        // Toggle visibility of shift labels on keys
        document.querySelectorAll('.shift-label').forEach(el => {
            if (this.isShift) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
    }

    toggleHyp() {
        if (!this.isOn) return;
        this.isHyp = !this.isHyp;
        this.hypIndicator.style.opacity = this.isHyp ? '1' : '0.2';
    }

    toggleAngleUnit() {
        if (!this.isOn) return;
        const units = ['DEG', 'RAD', 'GRAD'];
        let idx = (units.indexOf(this.angleUnit) + 1) % units.length;
        this.angleUnit = units[idx];
        this.angleIndicator.innerText = this.angleUnit;
    }

    cycleBase() {
        if (!this.isOn) return;
        const bases = ['DEC', 'BIN', 'OCT', 'HEX'];
        let idx = (bases.indexOf(this.baseMode) + 1) % bases.length;
        this.baseMode = bases[idx];
        this.baseIndicator.innerText = this.baseMode;
    }

    toggleTheme() {
        const htmlEl = document.documentElement;
        if (htmlEl.classList.contains('dark')) {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
        } else {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
        }
    }

    renderLCD() {
        if (!this.isOn) return;
        this.lcdMain.innerText = this.currentInput;
        this.lcdHistory.innerText = this.expressionHistory || '0';
        this.memoryIndicator.style.opacity = this.memory !== 0 ? '1' : '0';
    }

    insert(char) {
        if (!this.isOn) return;
        if (this.currentInput === '0' && char !== '.') {
            this.currentInput = char;
        } else {
            this.currentInput += char;
        }
        this.renderLCD();
    }

    backspace() {
        if (!this.isOn) return;
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.renderLCD();
    }

    clearAll() {
        if (!this.isOn) return;
        this.currentInput = '0';
        this.expressionHistory = '';
        this.isShift = false;
        this.isHyp = false;
        this.shiftIndicator.style.opacity = '0.2';
        this.hypIndicator.style.opacity = '0.2';
        document.querySelectorAll('.shift-label').forEach(el => el.classList.add('hidden'));
        this.renderLCD();
    }

    btnOp(op) {
        if (!this.isOn) return;
        this.currentInput += ' ' + op + ' ';
        this.renderLCD();
    }

    btnFunc(funcName) {
        if (!this.isOn) return;
        let actualFunc = funcName;

        // Handle Shift and Hyp states
        if (this.isShift) {
            if (funcName === 'sin') actualFunc = 'asin';
            else if (funcName === 'cos') actualFunc = 'acos';
            else if (funcName === 'tan') actualFunc = 'atan';
            else if (funcName === 'ln') actualFunc = 'exp';
            else if (funcName === 'log') actualFunc = 'pow10';
            else if (funcName === 'sqrt') actualFunc = 'sq';
            this.toggleShift();
        }

        if (this.isHyp) {
            if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(actualFunc)) {
                actualFunc = actualFunc + 'h';
            }
            this.toggleHyp();
        }

        switch (actualFunc) {
            case 'sin': case 'cos': case 'tan':
            case 'asin': case 'acos': case 'atan':
            case 'sinh': case 'cosh': case 'tanh':
            case 'sqrt': case 'ln': case 'log':
                this.currentInput = `${actualFunc}(${this.currentInput})`;
                break;
            case 'sq':
                this.currentInput = `(${this.currentInput})^2`;
                break;
            case 'exp':
                this.currentInput += 'e^';
                break;
            case 'pow10':
                this.currentInput += '10^';
                break;
            case 'ans':
                this.currentInput += this.lastAns;
                break;
        }
        this.renderLCD();
    }

    evaluate() {
        if (!this.isOn) return;
        try {
            let expr = this.currentInput;
            this.expressionHistory = expr + ' =';

            // Convert Angle Units if needed in Trigonometric Functions
            let parsedExpr = this.prepareMathExpression(expr);
            
            let result = eval(parsedExpr);

            if (typeof result === 'number' && !isNaN(result)) {
                // Rounding for crisp LCD representation
                result = Number(Math.round(result + 'e10') + 'e-10');
                this.lastAns = result;
                this.addHistory(expr, result);
                this.currentInput = result.toString();
            } else {
                this.currentInput = 'Error';
            }
        } catch (e) {
            this.currentInput = 'Syntax Error';
        }
        this.renderLCD();
    }

    prepareMathExpression(expr) {
        let parse = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**');

        // Trigonometric Conversions for DEG/GRAD
        const angleFactor = this.angleUnit === 'DEG' ? (Math.PI / 180) : (this.angleUnit === 'GRAD' ? (Math.PI / 200) : 1);

        // Math function mappings
        parse = parse.replace(/sin\(([^)]+)\)/g, (m, p) => `Math.sin((${p}) * ${angleFactor})`);
        parse = parse.replace(/cos\(([^)]+)\)/g, (m, p) => `Math.cos((${p}) * ${angleFactor})`);
        parse = parse.replace(/tan\(([^)]+)\)/g, (m, p) => `Math.tan((${p}) * ${angleFactor})`);
        
        parse = parse.replace(/asin\(([^)]+)\)/g, (m, p) => `(Math.asin(${p}) / ${angleFactor})`);
        parse = parse.replace(/acos\(([^)]+)\)/g, (m, p) => `(Math.acos(${p}) / ${angleFactor})`);
        parse = parse.replace(/atan\(([^)]+)\)/g, (m, p) => `(Math.atan(${p}) / ${angleFactor})`);

        parse = parse.replace(/sinh\(([^)]+)\)/g, 'Math.sinh($1)');
        parse = parse.replace(/cosh\(([^)]+)\)/g, 'Math.cosh($1)');
        parse = parse.replace(/tanh\(([^)]+)\)/g, 'Math.tanh($1)');

        parse = parse.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
        parse = parse.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
        parse = parse.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');

        return parse;
    }

    memAdd() {
        let val = parseFloat(this.currentInput);
        if (!isNaN(val)) {
            this.memory += val;
            this.renderLCD();
        }
    }

    memRecall() {
        this.currentInput = this.memory.toString();
        this.renderLCD();
    }

    memClear() {
        this.memory = 0;
        this.renderLCD();
    }

    addHistory(expr, result) {
        this.historyLog.unshift({ expr, result });
        this.renderHistoryUI();
    }

    clearHistory() {
        this.historyLog = [];
        this.renderHistoryUI();
    }

    renderHistoryUI() {
        const listEl = document.getElementById('historyList');
        if (this.historyLog.length === 0) {
            listEl.innerHTML = `<div class="text-center text-slate-400 dark:text-slate-500 py-10 text-xs italic">No calculations recorded yet.</div>`;
            return;
        }

        listEl.innerHTML = this.historyLog.map((item, idx) => `
            <div onclick="calc.useHistoryItem(${idx})" class="p-2.5 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition border border-slate-200 dark:border-slate-600/50">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono text-right">${item.expr}</div>
                <div class="text-sm font-bold font-mono text-right text-emerald-600 dark:text-emerald-400">${item.result}</div>
            </div>
        `).join('');
    }

    useHistoryItem(index) {
        if (this.historyLog[index]) {
            this.currentInput = this.historyLog[index].result.toString();
            this.renderLCD();
        }
    }

    openToolsModal() {
        document.getElementById('toolsModal').classList.remove('hidden');
        this.renderGraph();
    }

    closeToolsModal() {
        document.getElementById('toolsModal').classList.add('hidden');
    }

    switchTab(tabId) {
        document.querySelectorAll('.tool-tab').forEach(b => {
            b.classList.remove('border-blue-600', 'text-blue-600');
            b.classList.add('border-transparent', 'text-slate-500');
        });
        document.querySelectorAll('.tool-panel').forEach(p => p.classList.add('hidden'));

        document.getElementById(`tab-${tabId}`).classList.add('border-blue-600', 'text-blue-600');
        document.getElementById(`tab-${tabId}`).classList.remove('border-transparent', 'text-slate-500');
        document.getElementById(`panel-${tabId}`).classList.remove('hidden');

        if (tabId === 'graph') {
            setTimeout(() => this.renderGraph(), 50);
        }
    }

    initGraphingCanvas() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Canvas Interaction Events (Pan & Zoom)
        let isDragging = false;
        let lastX, lastY;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        window.addEventListener('mouseup', () => isDragging = false);

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.graphOffsetX += (e.clientX - lastX);
                this.graphOffsetY += (e.clientY - lastY);
                lastX = e.clientX;
                lastY = e.clientY;
                this.renderGraph();
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const xMinEl = document.getElementById('rangeXMin');
            const xMaxEl = document.getElementById('rangeXMax');
            let xMin = parseFloat(xMinEl.value) || -10;
            let xMax = parseFloat(xMaxEl.value) || 10;
            let span = xMax - xMin;

            if (e.deltaY < 0) {
                xMinEl.value = (xMin + span * 0.1).toFixed(1);
                xMaxEl.value = (xMax - span * 0.1).toFixed(1);
            } else {
                xMinEl.value = (xMin - span * 0.1).toFixed(1);
                xMaxEl.value = (xMax + span * 0.1).toFixed(1);
            }
            this.renderGraph();
        });
    }

    onGraphPresetChange() {
        const val = document.getElementById('graphPresetSelect').value;
        const customContainer = document.getElementById('customEquationContainer');
        const xyContainer = document.getElementById('xyPointsContainer');

        customContainer.classList.add('hidden');
        xyContainer.classList.add('hidden');

        if (val === 'custom') {
            customContainer.classList.remove('hidden');
        } else if (val === 'points') {
            xyContainer.classList.remove('hidden');
        }
        this.renderGraph();
    }

    resetGraphZoom() {
        document.getElementById('rangeXMin').value = -10;
        document.getElementById('rangeXMax').value = 10;
        document.getElementById('rangeYMin').value = -10;
        document.getElementById('rangeYMax').value = 10;
        this.graphOffsetX = 0;
        this.graphOffsetY = 0;
        this.renderGraph();
    }

    renderGraph() {
        if (!this.canvas) return;
        const width = this.canvas.width = this.canvas.parentElement.clientWidth;
        const height = this.canvas.height = this.canvas.parentElement.clientHeight;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        // Fetch X & Y Min/Max and Axis Labels
        const xMin = parseFloat(document.getElementById('rangeXMin').value) || -10;
        const xMax = parseFloat(document.getElementById('rangeXMax').value) || 10;
        const yMin = parseFloat(document.getElementById('rangeYMin').value) || -10;
        const yMax = parseFloat(document.getElementById('rangeYMax').value) || 10;
        const labelX = document.getElementById('labelX').value || 'X Axis';
        const labelY = document.getElementById('labelY').value || 'Y Axis';

        // Scale factors
        const scaleX = width / (xMax - xMin);
        const scaleY = height / (yMax - yMin);

        // Origin coordinates in pixels with pan offset
        const originX = -xMin * scaleX + this.graphOffsetX;
        const originY = height + (yMin * scaleY) + this.graphOffsetY;

        // Draw Grid Lines & Ticks
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';

        // Vertical Grid
        const xStep = Math.max((xMax - xMin) / 10, 1);
        for (let xVal = Math.ceil(xMin / xStep) * xStep; xVal <= xMax; xVal += xStep) {
            const px = (xVal - xMin) * scaleX + this.graphOffsetX;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, height);
            ctx.stroke();
            ctx.fillText(xVal.toFixed(1), px + 2, originY - 4 > 15 ? originY - 4 : 15);
        }

        // Horizontal Grid
        const yStep = Math.max((yMax - yMin) / 10, 1);
        for (let yVal = Math.ceil(yMin / yStep) * yStep; yVal <= yMax; yVal += yStep) {
            const py = height - ((yVal - yMin) * scaleY) + this.graphOffsetY;
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(width, py);
            ctx.stroke();
            ctx.fillText(yVal.toFixed(1), originX + 4 < width - 30 ? originX + 4 : width - 30, py - 2);
        }

        // Draw Main Axes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, originY); ctx.lineTo(width, originY);
        ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
        ctx.stroke();

        // Draw Axis Labels
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(labelX, width - 60, originY - 8 > 20 ? originY - 8 : 20);
        ctx.fillText(labelY, originX + 8 < width - 60 ? originX + 8 : 10, 15);

        const preset = document.getElementById('graphPresetSelect').value;
        document.getElementById('graphModeLabel').innerText = preset === 'points' ? 'Data Table Plot' : 'Function Curve';

        if (preset === 'points') {
            // Plot X/Y Data Points Table
            const rawData = document.getElementById('xyDataInput').value;
            const lines = rawData.split('\n');
            const points = [];

            lines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const pxVal = parseFloat(parts[0].trim());
                    const pyVal = parseFloat(parts[1].trim());
                    if (!isNaN(pxVal) && !isNaN(pyVal)) {
                        points.push({ x: pxVal, y: pyVal });
                    }
                }
            });

            // Draw Line connecting data points
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            let first = true;
            points.forEach(pt => {
                const px = (pt.x - xMin) * scaleX + this.graphOffsetX;
                const py = height - ((pt.y - yMin) * scaleY) + this.graphOffsetY;
                if (first) { ctx.moveTo(px, py); first = false; }
                else { ctx.lineTo(px, py); }
            });
            ctx.stroke();

            // Draw Point Markers
            ctx.fillStyle = '#f97316';
            points.forEach(pt => {
                const px = (pt.x - xMin) * scaleX + this.graphOffsetX;
                const py = height - ((pt.y - yMin) * scaleY) + this.graphOffsetY;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            });

        } else {
            // Plot Mathematical Function Curve
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            let fn = (x) => Math.sin(x);
            if (preset === 'sine') fn = (x) => Math.sin(x);
            else if (preset === 'cos') fn = (x) => Math.cos(x);
            else if (preset === 'tan') fn = (x) => Math.tan(x);
            else if (preset === 'quadratic') fn = (x) => x * x - 4;
            else if (preset === 'cubic') fn = (x) => x * x * x - 3 * x;
            else if (preset === 'exp') fn = (x) => Math.exp(0.5 * x);
            else if (preset === 'custom') {
                try {
                    const inputStr = document.getElementById('customEquationInput').value;
                    fn = new Function('x', `return ${inputStr};`);
                } catch (e) {
                    fn = (x) => 0;
                }
            }

            let isFirstPoint = true;
            for (let pixelX = 0; pixelX < width; pixelX += 2) {
                const mathX = xMin + (pixelX - this.graphOffsetX) / scaleX;
                try {
                    const mathY = fn(mathX);
                    const pixelY = height - ((mathY - yMin) * scaleY) + this.graphOffsetY;

                    if (!isNaN(pixelY) && Math.abs(pixelY) < height * 3) {
                        if (isFirstPoint) {
                            ctx.moveTo(pixelX, pixelY);
                            isFirstPoint = false;
                        } else {
                            ctx.lineTo(pixelX, pixelY);
                        }
                    } else {
                        isFirstPoint = true;
                    }
                } catch (e) {
                    isFirstPoint = true;
                }
            }
            ctx.stroke();
        }
    }

    updateConverterUnits() {
        const cat = document.getElementById('convCategory').value;
        const units = {
            length: ['Meters', 'Kilometers', 'Centimeters', 'Feet', 'Inches', 'Miles'],
            mass: ['Kilograms', 'Grams', 'Pounds', 'Ounces'],
            temp: ['Celsius', 'Fahrenheit', 'Kelvin'],
            pressure: ['Pascal', 'Bar', 'PSI', 'Atmosphere'],
            energy: ['Joules', 'Kilojoules', 'Calories', 'Kilocalories'],
            digital: ['Bytes', 'Kilobytes', 'Megabytes', 'Gigabytes', 'Terabytes']
        };

        const fromSelect = document.getElementById('convFrom');
        const toSelect = document.getElementById('convTo');

        fromSelect.innerHTML = units[cat].map(u => `<option value="${u}">${u}</option>`).join('');
        toSelect.innerHTML = units[cat].map(u => `<option value="${u}">${u}</option>`).join('');
        if (units[cat].length > 1) toSelect.selectedIndex = 1;

        this.processConversion();
    }

    processConversion() {
        const val = parseFloat(document.getElementById('convInput').value) || 0;
        const cat = document.getElementById('convCategory').value;
        const from = document.getElementById('convFrom').value;
        const to = document.getElementById('convTo').value;

        let res = val;
        if (cat === 'length') {
            const toMeters = { 'Meters': 1, 'Kilometers': 1000, 'Centimeters': 0.01, 'Feet': 0.3048, 'Inches': 0.0254, 'Miles': 1609.34 };
            res = (val * toMeters[from]) / toMeters[to];
        } else if (cat === 'mass') {
            const toKg = { 'Kilograms': 1, 'Grams': 0.001, 'Pounds': 0.453592, 'Ounces': 0.0283495 };
            res = (val * toKg[from]) / toKg[to];
        } else if (cat === 'temp') {
            let celsius = val;
            if (from === 'Fahrenheit') celsius = (val - 32) * 5/9;
            if (from === 'Kelvin') celsius = val - 273.15;

            if (to === 'Celsius') res = celsius;
            if (to === 'Fahrenheit') res = (celsius * 9/5) + 32;
            if (to === 'Kelvin') res = celsius + 273.15;
        }

        document.getElementById('convResult').innerText = res.toFixed(4) + ' ' + to;
    }

    processCurrency() {
        const amt = parseFloat(document.getElementById('currAmount').value) || 0;
        const from = document.getElementById('currFrom').value;
        const to = document.getElementById('currTo').value;

        const ratesInUSD = { USD: 1.0, EUR: 0.92, GBP: 0.78, JPY: 155.2, CAD: 1.36, NGN: 1480.0, INR: 83.5 };

        const valInUSD = amt / ratesInUSD[from];
        const finalVal = valInUSD * ratesInUSD[to];

        document.getElementById('currResult').innerText = finalVal.toFixed(2) + ' ' + to;
    }

    matrixAdd() {
        const a11 = +mA11.value, a12 = +mA12.value, a21 = +mA21.value, a22 = +mA22.value;
        const b11 = +mB11.value, b12 = +mB12.value, b21 = +mB21.value, b22 = +mB22.value;
        matrixOutput.innerHTML = `[ ${a11+b11}, ${a12+b12} ]<br>[ ${a21+b21}, ${a22+b22} ]`;
    }

    matrixSub() {
        const a11 = +mA11.value, a12 = +mA12.value, a21 = +mA21.value, a22 = +mA22.value;
        const b11 = +mB11.value, b12 = +mB12.value, b21 = +mB21.value, b22 = +mB22.value;
        matrixOutput.innerHTML = `[ ${a11-b11}, ${a12-b12} ]<br>[ ${a21-b21}, ${a22-b22} ]`;
    }

    matrixDetA() {
        const det = (+mA11.value * +mA22.value) - (+mA12.value * +mA21.value);
        matrixOutput.innerHTML = `Determinant of Matrix A = <b>${det}</b>`;
    }

    matrixInvA() {
        const a = +mA11.value, b = +mA12.value, c = +mA21.value, d = +mA22.value;
        const det = (a * d) - (b * c);
        if (det === 0) {
            matrixOutput.innerHTML = `Matrix A is Singular (Determinant = 0), Inverse does not exist.`;
            return;
        }
        matrixOutput.innerHTML = `[ ${(d/det).toFixed(2)}, ${(-b/det).toFixed(2)} ]<br>[ ${(-c/det).toFixed(2)}, ${(a/det).toFixed(2)} ]`;
    }

    solvePolynomial() {
        const a = parseFloat(polyA.value);
        const b = parseFloat(polyB.value);
        const c = parseFloat(polyC.value);

        if (a === 0) {
            polyRootsResult.innerText = "Coefficient 'a' cannot be 0 for a quadratic equation.";
            return;
        }

        const disc = b * b - 4 * a * c;
        if (disc > 0) {
            const x1 = (-b + Math.sqrt(disc)) / (2 * a);
            const x2 = (-b - Math.sqrt(disc)) / (2 * a);
            polyRootsResult.innerText = `x1 = ${x1.toFixed(4)},  x2 = ${x2.toFixed(4)}`;
        } else if (disc === 0) {
            const x = -b / (2 * a);
            polyRootsResult.innerText = `Double Root: x = ${x.toFixed(4)}`;
        } else {
            const real = (-b / (2 * a)).toFixed(4);
            const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
            polyRootsResult.innerText = `x1 = ${real} + ${imag}i,  x2 = ${real} - ${imag}i`;
        }
    }

    solveOhm() {
        let v = parseFloat(ohmVoltage.value);
        let i = parseFloat(ohmCurrent.value);
        let r = parseFloat(ohmResist.value);

        if (isNaN(v) && !isNaN(i) && !isNaN(r)) ohmVoltage.value = (i * r).toFixed(2);
        else if (isNaN(i) && !isNaN(v) && !isNaN(r) && r !== 0) ohmCurrent.value = (v / r).toFixed(2);
        else if (isNaN(r) && !isNaN(v) && !isNaN(i) && i !== 0) ohmResist.value = (v / i).toFixed(2);
    }

    solveWave(type) {
        if (type === 'f') {
            let f = parseFloat(waveFreq.value);
            if (!isNaN(f) && f !== 0) wavePeriod.value = (1 / f).toFixed(6);
        } else {
            let t = parseFloat(wavePeriod.value);
            if (!isNaN(t) && t !== 0) waveFreq.value = (1 / t).toFixed(6);
        }
    }

    initConstants() {
        const constants = [
            { name: 'Speed of Light (c)', val: '299792458' },
            { name: "Planck's Constant (h)", val: '6.62607015e-34' },
            { name: 'Gravitational Constant (G)', val: '6.67430e-11' },
            { name: 'Avogadro Constant (Na)', val: '6.02214076e23' },
            { name: 'Boltzmann Constant (k)', val: '1.380649e-23' },
            { name: 'Electron Mass (me)', val: '9.1093837e-31' },
            { name: 'Elementary Charge (e)', val: '1.60217663e-19' }
        ];

        const container = document.getElementById('constantsListGrid');
        container.innerHTML = constants.map(c => `
            <div onclick="calc.insertConstant('${c.val}')" class="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span class="font-medium text-slate-700 dark:text-slate-300">${c.name}</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${c.val}</span>
            </div>
        `).join('');
    }

    insertConstant(val) {
        this.insert(val);
        this.closeToolsModal();
    }
}

let calc;
window.onload = function () {
    calc = new CalculatorEngine();
};