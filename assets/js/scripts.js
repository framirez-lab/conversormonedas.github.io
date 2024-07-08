document.addEventListener('DOMContentLoaded', datos);
const select = document.querySelector('#select');  // Asegúrate de que el id es 'miSelect' en tu HTML
const boton = document.querySelector('.boton');
const clp = document.querySelector('#clp');
const resultado = document.querySelector('#resultado');
let template = '';
let chart = null;

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

async function datos() {
    let data;
    try {
        data = await fetchData('https://mindicador.cl/api');
    } catch (error) {
        try {
            data = await fetchData('./mindicador.json');  // Ruta del archivo JSON local
            alert("Error en API. Cargando datos de un recurso offline...");
        } catch (error) {
            console.error('Error al cargar datos locales:', error);
            alert("Error crítico. No se pudieron cargar los datos.");
            return;
        }
    }

    const indicadores = Object.keys(data).filter(key => key !== 'version' && key !== 'autor' && key !== 'fecha').map(key => ({
        nombre: data[key].nombre,
        codigo: data[key].codigo
    }));

    for (const indicador of indicadores) {
        template += `<option value="${indicador.codigo}">${indicador.nombre}</option>`;
    }
    select.innerHTML = template;
}

async function renderizarGrafico() {
    const selectedName = select.value;
    let data;
    try {
        const response = await fetch(`https://mindicador.cl/api/${selectedName.toLowerCase()}`);
        data = await response.json();
    } catch (error) {
        try {
            const localData = await fetchData('./mindicador.json');
            data = localData[selectedName];
        } catch (error) {
            console.error('Error al cargar datos locales:', error);
            return;
        }
    }

    const serie = data.serie.slice(0, 10).reverse(); // Ordenar los últimos 10 días de forma ascendente
    const labels = serie.map(item => item.fecha.substring(0, 10));
    const valores = serie.map(item => item.valor);

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: selectedName,
                backgroundColor: 'green',
                data: valores
            }]
        }
    };

    const chartDOM = document.getElementById("charter");
    if (chart) {
        chart.destroy();
    }
    chartDOM.style.backgroundColor = 'white';
    chart = new Chart(chartDOM, config);
}

async function calcPesos() {
    const selectedName = select.value;
    const clps = clp.value;
    let data;
    try {
        const response = await fetch(`https://mindicador.cl/api/${selectedName.toLowerCase()}`);
        data = await response.json();
    } catch (error) {
        try {
            const localData = await fetchData('./mindicador.json');
            data = localData[selectedName];
        } catch (error) {
            console.error('Error al cargar datos locales:', error);
            alert("Error crítico. No se pudieron cargar los datos.");
            return;
        }
    }
    
    const valor = data.serie[0].valor;
    const pesos = clps / valor;
    resultado.innerHTML = `<h2>Resultado: $${pesos.toFixed(2)}</h2>`;
    renderizarGrafico();
}

boton.addEventListener('click', calcPesos);

