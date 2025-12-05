// Referencias al DOM
const areaInput = document.getElementById('area');
const velocityInput = document.getElementById('velocity');
const btnCalc = document.getElementById('btn-calc');
const btnReset = document.getElementById('btn-reset');
const resultContainer = document.getElementById('result-container');
const qValueSpan = document.getElementById('q-value');
const statusBadge = document.getElementById('status-text');
const ctx = document.getElementById('flowChart').getContext('2d');

let myChart = null;

// Configuración de límites para el semáforo (Ejemplo)
const THRESHOLD_LOW = 0.1;
const THRESHOLD_HIGH = 0.25;

// Función Principal: Calcular
btnCalc.addEventListener('click', () => {
  const area = parseFloat(areaInput.value);
  const velocity = parseFloat(velocityInput.value);

  // Validación básica
  if (isNaN(area) || isNaN(velocity) || area <= 0 || velocity < 0) {
    alert("Por favor ingrese valores válidos (mayores a 0 para el área).");
    return;
  }

  // 1. Calcular Q
  const caudal = area * velocity;

  // 2. Mostrar Resultado
  qValueSpan.innerText = caudal.toFixed(3);
  resultContainer.classList.remove('hidden');

  // 3. Semáforo
  updateStatus(caudal);

  // 4. Generar Gráfico
  updateChart(area, velocity, caudal);
});

// Función: Resetear
btnReset.addEventListener('click', () => {
  areaInput.value = '';
  velocityInput.value = '';
  resultContainer.classList.add('hidden');
  if (myChart) {
    myChart.destroy();
    myChart = null;
  }
});

// Lógica del Semáforo
function updateStatus(q) {
  // Limpiar clases anteriores
  statusBadge.className = 'status-badge';

  if (q < THRESHOLD_LOW) {
    statusBadge.innerText = "Bajo Caudal";
    statusBadge.classList.add('status-low');
  } else if (q >= THRESHOLD_LOW && q <= THRESHOLD_HIGH) {
    statusBadge.innerText = "Caudal Operativo";
    statusBadge.classList.add('status-mid');
  } else {
    statusBadge.innerText = "Caudal Alto / Crítico";
    statusBadge.classList.add('status-high');
  }
}

// Lógica del Gráfico (Chart.js)
function updateChart(A, vUser, qUser) {
  // Definir rango del eje X para que se vea bien
  // El gráfico irá desde 0 hasta un poco más de la velocidad del usuario
  const maxV = Math.max(3, vUser * 1.2); 
  
  // Puntos para la línea de tendencia (Función Lineal Q = A * v)
  // Punto inicial (0,0) y punto final proyectado
  const lineData = [
    { x: 0, y: 0 },
    { x: maxV, y: A * maxV }
  ];

  // Punto específico del usuario
  const pointData = [
    { x: vUser, y: qUser }
  ];

  // Si ya existe un gráfico, destruirlo para crear el nuevo
  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Curva de Comportamiento (Q = A·v)',
          data: lineData,
          showLine: true, // Conectar puntos con línea
          borderColor: '#9ca3af',
          borderWidth: 2,
          borderDash: [5, 5], // Línea punteada para el fondo
          pointRadius: 0, // No mostrar puntos en la línea de referencia
          fill: false,
          order: 2
        },
        {
          label: 'Tu punto actual',
          data: pointData,
          backgroundColor: '#4f46e5', // Color primario
          pointRadius: 6,
          pointHoverRadius: 8,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Velocidad v (m/s)'
          },
          min: 0,
          max: maxV
        },
        y: {
          title: {
            display: true,
            text: 'Caudal Q (m³/s)'
          },
          min: 0
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `v: ${context.parsed.x} m/s, Q: ${context.parsed.y.toFixed(3)} m³/s`;
              }
              return label;
            }
          }
        }
      }
    }
  });
}