/**
 * DOS RUEDAS 2.0 - SISTEMA DE CONTROL DE TALLER Y VENTAS
 * Lógica funcional completa del MVP:
 * - Formularios reactivos condicionales
 * - Almacenamiento local (LocalStorage)
 * - Métricas del Dashboard (ventas mes, servicios mes, top 5 servicios)
 * - Remisión PDF con términos del Código de Comercio de Colombia
 * - Enlace y formato de cotización para WhatsApp en texto plano
 */

(function () {
  'use strict';

  // LLAVE DE ALMACENAMIENTO LOCAL
  const STORAGE_KEY = 'dos_ruedas_registros_v2';

  // DATOS DE EJEMPLO INICIALES (Para probar de inmediato)
  const DATOS_SEMILLA = [
    {
      id: 'DR-2026-001',
      fecha: '2026-10-02T09:30',
      clienteNombre: 'Andrés Felipe Morales',
      clienteTel: '3157894512',
      biciDetalle: 'Trek Marlin 7 - Azul Mate',
      tipoAtencion: 'servicio',
      tipoRepuesto: '',
      nombreRepuesto: '',
      tipoServicio: 'Mantenimiento General Completo',
      observacion: 'Bicicleta ingresa con barro en piñonería y juego en centro pedalier. Rayón leve en biela derecha.',
      valor: 120000
    },
    {
      id: 'DR-2026-002',
      fecha: '2026-10-04T11:15',
      clienteNombre: 'Laura Camila Restrepo',
      clienteTel: '3004561234',
      biciDetalle: 'Scott Aspect 950 - Negra',
      tipoAtencion: 'ambos',
      tipoRepuesto: 'Frenos',
      nombreRepuesto: 'Juego de Pastillas Shimano B05S Resina',
      tipoServicio: 'Purga y Calibración de Frenos Hidráulicos',
      observacion: 'Freno trasero sin presión y pastillas cristalizadas. Se requiere cambio inmediato y purga con aceite mineral.',
      valor: 85000
    },
    {
      id: 'DR-2026-003',
      fecha: '2026-10-06T15:20',
      clienteNombre: 'Mateo Gómez Valencia',
      clienteTel: '3129876543',
      biciDetalle: 'Specialized Chisel - Gris',
      tipoAtencion: 'venta',
      tipoRepuesto: 'Transmisión',
      nombreRepuesto: 'Cadena KMC X11 Silver 118 Eslabones',
      tipoServicio: '',
      observacion: 'Cliente compra repuesto en mostrador para instalación particular.',
      valor: 110000
    },
    {
      id: 'DR-2026-004',
      fecha: '2026-10-08T16:40',
      clienteNombre: 'Diana Marcela Torres',
      clienteTel: '3186543210',
      biciDetalle: 'GW Lynx Rin 27.5 - Fucsia/Negro',
      tipoAtencion: 'servicio',
      tipoRepuesto: '',
      nombreRepuesto: '',
      tipoServicio: 'Ajuste y Sincronización de Cambios',
      observacion: 'Cambios saltan en piñón 5 y 6. Guaya deshilachada.',
      valor: 35000
    },
    {
      id: 'DR-2026-005',
      fecha: '2026-10-09T10:00',
      clienteNombre: 'Juan Pablo Echeverri',
      clienteTel: '3201239874',
      biciDetalle: 'Giant Talon 1 - Verde Oliva',
      tipoAtencion: 'servicio',
      tipoRepuesto: '',
      nombreRepuesto: '',
      tipoServicio: 'Mantenimiento General Completo',
      observacion: 'Ingreso rutinario preventivo pre-competencia.',
      valor: 130000
    },
    {
      id: 'DR-2026-006',
      fecha: '2026-10-10T14:10',
      clienteNombre: 'Camilo Andrés Serna',
      clienteTel: '3117458923',
      biciDetalle: 'Venzo Raptor - Blanca',
      tipoAtencion: 'ambos',
      tipoRepuesto: 'Ruedas y Neumáticos',
      nombreRepuesto: 'Coraza Maxxis Ikon 29x2.20 Tubeless Ready',
      tipoServicio: 'Centrado y Nivelación de Rines',
      observacion: 'Rin trasero descentrado tras golpe con piedra y llanta desgastada.',
      valor: 195000
    },
    {
      id: 'DR-2026-007',
      fecha: '2026-10-11T11:00',
      clienteNombre: 'Santiago Ospina',
      clienteTel: '3012223344',
      biciDetalle: 'BMC Teammachine - Roja',
      tipoAtencion: 'servicio',
      tipoRepuesto: '',
      nombreRepuesto: '',
      tipoServicio: 'Lavado y Desengrase Especializado',
      observacion: 'Desengrase de transmisión con baño ultrasónico.',
      valor: 45000
    }
  ];

  // ESTADO DE LA APLICACIÓN
  let registros = [];
  let registroSeleccionadoParaWA = null;

  // ELEMENTOS DEL DOM
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewPanels = document.querySelectorAll('.view-panel');
  const liveClockEl = document.getElementById('current-clock');

  // Formulario
  const formRegistro = document.getElementById('form-registro');
  const campoFecha = document.getElementById('campo-fecha');
  const campoTipoAtencion = document.getElementById('campo-tipo-atencion');
  const campoClienteNombre = document.getElementById('campo-cliente-nombre');
  const campoClienteTel = document.getElementById('campo-cliente-tel');
  const indicadorReqNombre = document.getElementById('indicador-req-nombre');
  const indicadorReqTel = document.getElementById('indicador-req-tel');
  const helpClienteTel = document.getElementById('help-cliente-tel');
  const campoBiciDetalle = document.getElementById('campo-bici-detalle');
  const seccionRepuesto = document.getElementById('seccion-repuesto');
  const campoTipoRepuesto = document.getElementById('campo-tipo-repuesto');
  const campoNombreRepuesto = document.getElementById('campo-nombre-repuesto');
  const seccionServicio = document.getElementById('seccion-servicio');
  const campoTipoServicio = document.getElementById('campo-tipo-servicio');
  const campoObservacion = document.getElementById('campo-observacion');
  const campoValor = document.getElementById('campo-valor');
  const btnLimpiarForm = document.getElementById('btn-limpiar-form');

  // Tabla y Filtros
  const tablaBody = document.getElementById('tabla-registros-body');
  const filtroBusqueda = document.getElementById('filtro-busqueda');
  const filtroTipo = document.getElementById('filtro-tipo');
  const conteoFiltrados = document.getElementById('conteo-filtrados');
  const conteoTotales = document.getElementById('conteo-totales');
  const totalVisibleValor = document.getElementById('total-visible-valor');
  const badgeTotalRegistros = document.getElementById('total-registros-badge');

  // Dashboard KPIs
  const kpiTotalAtenciones = document.getElementById('kpi-total-atenciones');
  const kpiSubTotal = document.getElementById('kpi-sub-total');
  const kpiRecaudoVentas = document.getElementById('kpi-recaudo-ventas');
  const kpiCantVentas = document.getElementById('kpi-cant-ventas');
  const kpiRecaudoServicios = document.getElementById('kpi-recaudo-servicios');
  const kpiCantServicios = document.getElementById('kpi-cant-servicios');
  const kpiRecaudoTotal = document.getElementById('kpi-recaudo-total');
  const topServiciosContainer = document.getElementById('top-servicios-container');
  const ultimosRegistrosList = document.getElementById('ultimos-registros-list');
  const labelMesActual = document.getElementById('label-mes-actual');

  // Modal WhatsApp
  const modalWhatsapp = document.getElementById('modal-whatsapp');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const modalWaCliente = document.getElementById('modal-wa-cliente');
  const modalWaTel = document.getElementById('modal-wa-tel');
  const modalWaTexto = document.getElementById('modal-wa-texto');
  const btnCopiarWa = document.getElementById('btn-copiar-wa');
  const btnAbrirWa = document.getElementById('btn-abrir-wa');

  // Botones Generales
  const btnSeedData = document.getElementById('btn-seed-data');
  const btnExportJson = document.getElementById('btn-export-json');

  // ==========================================================
  // INICIALIZACIÓN
  // ==========================================================
  function init() {
    cargarDatos();
    iniciarReloj();
    configurarNavegacion();
    configurarEventosFormulario();
    configurarEventosTabla();
    configurarEventosModal();
    configurarAccionesGenerales();
    resetearFormulario();
    renderizarTodo();
  }

  // ==========================================================
  // GESTIÓN DE PERSISTENCIA Y CARGA DE DATOS
  // ==========================================================
  function cargarDatos() {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        registros = JSON.parse(guardado);
      } else {
        registros = [...DATOS_SEMILLA];
        guardarDatos();
      }
    } catch (e) {
      console.warn('Error al leer de localStorage, usando datos semilla:', e);
      registros = [...DATOS_SEMILLA];
    }
  }

  function guardarDatos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }

  function formatearMonedaCOP(valor) {
    const num = Number(valor) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(num);
  }

  function obtenerFechaHoraActualISO() {
    const ahora = new Date();
    // Formato local YYYY-MM-DDTHH:mm para input datetime-local
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    const hours = String(ahora.getHours()).padStart(2, '0');
    const minutes = String(ahora.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function iniciarReloj() {
    function actualizar() {
      const ahora = new Date();
      if (liveClockEl) {
        liveClockEl.textContent = ahora.toLocaleTimeString('es-CO');
      }
    }
    actualizar();
    setInterval(actualizar, 1000);
  }

  // ==========================================================
  // NAVEGACIÓN ENTRE PESTAÑAS (TABS)
  // ==========================================================
  function configurarNavegacion() {
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        
        navTabs.forEach(t => t.classList.remove('active'));
        viewPanels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        // Si navega al formulario, refrescar la fecha automática
        if (targetId === 'vista-registro') {
          campoFecha.value = obtenerFechaHoraActualISO();
        }

        // Si navega a dashboard o tabla, actualizar vistas
        renderizarTodo();
      });
    });
  }

  // ==========================================================
  // LÓGICA DEL FORMULARIO Y CAMPOS CONDICIONALES
  // ==========================================================
  function configurarEventosFormulario() {
    // Cambio en Tipo de Atención (Control Dinámico Obligatorio)
    campoTipoAtencion.addEventListener('change', actualizarCamposCondicionales);

    // Envío del Formulario
    formRegistro.addEventListener('submit', manejarGuardadoRegistro);

    // Botón Limpiar Formulario
    btnLimpiarForm.addEventListener('click', () => {
      if (confirm('¿Deseas restablecer los campos del formulario?')) {
        resetearFormulario();
      }
    });
  }

  function actualizarCamposCondicionales() {
    const seleccion = campoTipoAtencion.value;

    if (seleccion === 'venta') {
      // Mostrar repuesto, ocultar servicio
      seccionRepuesto.classList.remove('hidden');
      seccionServicio.classList.add('hidden');

      campoTipoRepuesto.required = true;
      campoNombreRepuesto.required = true;
      campoTipoServicio.required = false;
      campoTipoServicio.value = '';
    } else if (seleccion === 'servicio') {
      // Mostrar servicio, ocultar repuesto
      seccionRepuesto.classList.add('hidden');
      seccionServicio.classList.remove('hidden');

      campoTipoRepuesto.required = false;
      campoNombreRepuesto.required = false;
      campoTipoRepuesto.value = '';
      campoNombreRepuesto.value = '';
      campoTipoServicio.required = true;
    } else if (seleccion === 'ambos') {
        // Mostrar ambos
        seccionRepuesto.classList.remove('hidden');
        seccionServicio.classList.remove('hidden');

        campoTipoRepuesto.required = true;
        campoNombreRepuesto.required = true;
        campoTipoServicio.required = true;
    } else {
        // Ninguno seleccionado
        seccionRepuesto.classList.add('hidden');
        seccionServicio.classList.add('hidden');
        campoTipoRepuesto.required = false;
        campoNombreRepuesto.required = false;
        campoTipoServicio.required = false;
    }

    // Actualizar indicadores de campos obligatorios para nombre y teléfono del cliente
    const esObligatorio = (campoTipoAtencion.value !== 'venta');
    if (indicadorReqNombre) indicadorReqNombre.style.display = esObligatorio ? 'inline' : 'none';
    if (indicadorReqTel) indicadorReqTel.style.display = esObligatorio ? 'inline' : 'none';
    if (helpClienteTel) helpClienteTel.style.display = esObligatorio ? 'block' : 'none';
  }

  function resetearFormulario() {
    formRegistro.reset();
    // 1. Guardado de fecha automático
    campoFecha.value = obtenerFechaHoraActualISO();
    actualizarCamposCondicionales();
  }

  function generarSiguienteConsecutivo() {
    const anio = new Date().getFullYear();
    const numero = registros.length + 1;
    return `DR-${anio}-${String(numero).padStart(3, '0')}`;
  }

  function manejarGuardadoRegistro(e) {
    e.preventDefault();

    // Validaciones
    const tipoAtencion = campoTipoAtencion.value;
    if (!tipoAtencion) {
      alert('Por favor selecciona el Tipo de Atención (Venta, Servicio o Ambos).');
      campoTipoAtencion.focus();
      return;
    }

    const valorNum = parseFloat(campoValor.value);
    if (isNaN(valorNum) || valorNum <= 0) {
      alert('Por favor ingresa un Valor válido superior a $0.');
      campoValor.focus();
      return;
    }

    if (tipoAtencion === 'venta' || tipoAtencion === 'ambos') {
      if (!campoTipoRepuesto.value) {
        alert('El Tipo de Repuesto es obligatorio para esta atención.');
        campoTipoRepuesto.focus();
        return;
      }
      if (!campoNombreRepuesto.value.trim()) {
        alert('El Nombre del Repuesto es obligatorio para esta atención.');
        campoNombreRepuesto.focus();
        return;
      }
    }

    if (tipoAtencion === 'servicio' || tipoAtencion === 'ambos') {
      if (!campoTipoServicio.value) {
        alert('El Tipo de Servicio es obligatorio para esta atención.');
        campoTipoServicio.focus();
        return;
      }
    }

    // Cliente nombre y teléfono son obligatorios a menos que Tipo de Atención sea 'venta'
    if (tipoAtencion !== 'venta') {
      if (!campoClienteNombre.value.trim()) {
        alert('Por favor ingresa el Nombre del Cliente.');
        campoClienteNombre.focus();
        return;
      }

      if (!campoClienteTel.value.trim()) {
        alert('Por favor ingresa el Teléfono / WhatsApp del Cliente.');
        campoClienteTel.focus();
        return;
      }
    }

    // Construcción del nuevo registro
    const nuevoRegistro = {
      id: generarSiguienteConsecutivo(),
      fecha: campoFecha.value || obtenerFechaHoraActualISO(),
      clienteNombre: campoClienteNombre.value.trim(),
      clienteTel: campoClienteTel.value.trim(),
      biciDetalle: campoBiciDetalle.value.trim(),
      tipoAtencion: tipoAtencion,
      tipoRepuesto: (tipoAtencion === 'venta' || tipoAtencion === 'ambos') ? campoTipoRepuesto.value : '',
      nombreRepuesto: (tipoAtencion === 'venta' || tipoAtencion === 'ambos') ? campoNombreRepuesto.value.trim() : '',
      tipoServicio: (tipoAtencion === 'servicio' || tipoAtencion === 'ambos') ? campoTipoServicio.value : '',
      observacion: campoObservacion.value.trim(),
      valor: valorNum
    };

    // Agregar al inicio del arreglo
    registros.unshift(nuevoRegistro);
    guardarDatos();

    alert(`✅ Registro ${nuevoRegistro.id} guardado con éxito.`);
    resetearFormulario();

    // Redirigir a la vista de historial para ver el registro
    const tabTabla = document.querySelector('[data-target="vista-tabla"]');
    if (tabTabla) tabTabla.click();
  }

  // ==========================================================
  // DASHBOARD Y ESTADÍSTICAS DEL MES EN CURSO
  // ==========================================================
  function actualizarDashboard() {
    const ahora = new Date();
    const mesActual = ahora.getMonth(); // 0 a 11
    const anioActual = ahora.getFullYear();

    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    if (labelMesActual) {
      labelMesActual.textContent = `${nombresMeses[mesActual]} ${anioActual}`;
    }

    // Filtrar registros correspondientes al mes en curso
    const registrosMes = registros.filter(r => {
      const f = new Date(r.fecha);
      return f.getMonth() === mesActual && f.getFullYear() === anioActual;
    });

    let totalVentasCOP = 0;
    let cantVentas = 0;
    let totalServiciosCOP = 0;
    let cantServicios = 0;
    let cantAmbos = 0;

    // Conteo y suma
    registrosMes.forEach(r => {
      const val = Number(r.valor) || 0;
      if (r.tipoAtencion === 'venta') {
        cantVentas++;
        totalVentasCOP += val;
      } else if (r.tipoAtencion === 'servicio') {
        cantServicios++;
        totalServiciosCOP += val;
      } else if (r.tipoAtencion === 'ambos') {
        cantAmbos++;
        // Para registros que combinan ambos, distribuimos 50% y 50% en el recaudo estadístico
        cantVentas++;
        cantServicios++;
        totalVentasCOP += (val * 0.5);
        totalServiciosCOP += (val * 0.5);
      }
    });

    const granTotalRecaudo = totalVentasCOP + totalServiciosCOP;

    // Actualizar elementos visuales del Dashboard
    kpiTotalAtenciones.textContent = registrosMes.length;
    kpiSubTotal.textContent = `${cantVentas} Ventas | ${cantServicios} Servicios `;

    kpiRecaudoVentas.textContent = formatearMonedaCOP(totalVentasCOP);
    kpiCantVentas.textContent = `${cantVentas} transacciones en el mes`;

    kpiRecaudoServicios.textContent = formatearMonedaCOP(totalServiciosCOP);
    kpiCantServicios.textContent = `${cantServicios} servicios realizados`;

    kpiRecaudoTotal.textContent = formatearMonedaCOP(granTotalRecaudo);

    // Calcular TOP 5 Servicios Más Pedidos (sobre todo el histórico o mes)
    actualizarTopServicios();

    // Actualizar lista de últimos movimientos en el Dashboard
    actualizarUltimosMovimientos();

    // Actualizar badge del total general
    if (badgeTotalRegistros) {
      badgeTotalRegistros.textContent = registros.length;
    }
  }

  function actualizarTopServicios() {
    const mapaConteo = {};

    registros.forEach(r => {
      if (r.tipoServicio && (r.tipoAtencion === 'servicio' || r.tipoAtencion === 'ambos')) {
        mapaConteo[r.tipoServicio] = (mapaConteo[r.tipoServicio] || 0) + 1;
      }
    });

    // Convertir a array y ordenar de mayor a menor
    const ranking = Object.keys(mapaConteo)
      .map(nombre => ({ nombre, cantidad: mapaConteo[nombre] }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Los 5 más pedidos

    const maxCantidad = ranking.length > 0 ? ranking[0].cantidad : 1;

    topServiciosContainer.innerHTML = '';

    if (ranking.length === 0) {
      topServiciosContainer.innerHTML = `
        <div style="color: #94a3b8; font-size: 0.9rem; text-align: center; padding: 20px;">
          No hay servicios registrados todavía.
        </div>
      `;
      return;
    }

    ranking.forEach((item, index) => {
      const porcentaje = Math.round((item.cantidad / maxCantidad) * 100);
      const div = document.createElement('div');
      div.className = 'top-service-item';
      div.innerHTML = `
        <div class="top-service-header">
          <span><span class="service-rank-badge">#${index + 1}</span> ${item.nombre}</span>
          <span style="color: var(--primary); font-weight: 700;">${item.cantidad} veces</span>
        </div>
        <div class="top-service-bar-bg">
          <div class="top-service-bar-fill" style="width: ${porcentaje}%;"></div>
        </div>
      `;
      topServiciosContainer.appendChild(div);
    });
  }

  function actualizarUltimosMovimientos() {
    ultimosRegistrosList.innerHTML = '';
    const ultimos = registros.slice(0, 4);

    if (ultimos.length === 0) {
      ultimosRegistrosList.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem; padding: 10px;">Sin registros recientes.</div>';
      return;
    }

    ultimos.forEach(item => {
      const div = document.createElement('div');
      div.className = `recent-item tipo-${item.tipoAtencion}`;
      
      let detalle = '';
      if (item.tipoAtencion === 'venta') detalle = item.nombreRepuesto || 'Repuesto';
      else if (item.tipoAtencion === 'servicio') detalle = item.tipoServicio || 'Servicio';
      else detalle = `${item.tipoServicio || 'Servicio'} + Repuesto`;

      div.innerHTML = `
        <div>
          <strong>${item.clienteNombre}</strong>
          <div style="color: #64748b; font-size: 0.78rem;">${item.id} &bull; ${detalle}</div>
        </div>
        <div style="font-weight: 700; color: #047857;">
          ${formatearMonedaCOP(item.valor)}
        </div>
      `;
      ultimosRegistrosList.appendChild(div);
    });
  }

  // ==========================================================
  // TABLA DE DETALLE, FILTROS Y ACCIONES
  // ==========================================================
  function configurarEventosTabla() {
    filtroBusqueda.addEventListener('input', renderizarTabla);
    filtroTipo.addEventListener('change', renderizarTabla);
  }

  function renderizarTabla() {
    const texto = filtroBusqueda.value.toLowerCase().trim();
    const filtroTipoVal = filtroTipo.value;

    const filtrados = registros.filter(r => {
      // Filtro por tipo
      if (filtroTipoVal !== 'todos' && r.tipoAtencion !== filtroTipoVal) {
        return false;
      }

      // Filtro por texto
      if (texto) {
        const busquedaTotal = [
          r.id,
          r.clienteNombre,
          r.clienteTel,
          r.biciDetalle,
          r.tipoRepuesto,
          r.nombreRepuesto,
          r.tipoServicio,
          r.observacion
        ].filter(Boolean).join(' ').toLowerCase();

        return busquedaTotal.includes(texto);
      }

      return true;
    });

    tablaBody.innerHTML = '';
    let sumaVisible = 0;

    if (filtrados.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 30px; color: #94a3b8;">
            No se encontraron registros que coincidan con la búsqueda.
          </td>
        </tr>
      `;
    } else {
      filtrados.forEach(r => {
        sumaVisible += Number(r.valor) || 0;
        const tr = document.createElement('tr');

        // Formato de fecha
        const fechaObj = new Date(r.fecha);
        const fechaStr = isNaN(fechaObj.getTime())
          ? r.fecha
          : fechaObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

        // Badge Tipo
        let badgeTipo = '';
        if (r.tipoAtencion === 'venta') badgeTipo = '<span class="badge-pill pill-venta">🛒 Venta</span>';
        else if (r.tipoAtencion === 'servicio') badgeTipo = '<span class="badge-pill pill-servicio">🔧 Servicio</span>';
        else badgeTipo = '<span class="badge-pill pill-ambos">✨ Ambos</span>';

        // Detalle según tipo
        let detalleHtml = '';
        if (r.tipoAtencion === 'venta') {
          detalleHtml = `<b>Repuesto:</b> ${r.nombreRepuesto || '-'}<br><small style="color: #64748b;">Cat: ${r.tipoRepuesto || '-'}</small>`;
        } else if (r.tipoAtencion === 'servicio') {
          detalleHtml = `<b>Servicio:</b> ${r.tipoServicio || '-'}`;
        } else {
          detalleHtml = `
            <b>Servicio:</b> ${r.tipoServicio || '-'}<br>
            <b>Repuesto:</b> ${r.nombreRepuesto || '-'}`;
        }

        if (r.biciDetalle) {
          detalleHtml += `<br><small style="color: #0369a1;">🚲 ${r.biciDetalle}</small>`;
        }

        // Acciones disponibles:
        // WhatsApp para todos los registros
        // PDF solo para los que tienen Servicio (servicio o ambos) según requerimiento exclusivo
        const tieneServicio = (r.tipoAtencion === 'servicio' || r.tipoAtencion === 'ambos');

        const btnPdfHtml = tieneServicio ? `
          <button class="btn-table btn-pdf" title="Descargar Remisión PDF con Código de Comercio" onclick="window.DosRuedasApp.generarPdfRemision('${r.id}')">
            📄 Remisión PDF
          </button>
        ` : '';

        const btnWaHtml = `
          <button class="btn-table btn-wa" title="Enviar cotización a WhatsApp" onclick="window.DosRuedasApp.abrirModalWhatsApp('${r.id}')">
            💬 WhatsApp
          </button>
        `;

        const btnEliminarHtml = `
          <button class="btn-table btn-delete" title="Eliminar registro" onclick="window.DosRuedasApp.eliminarRegistro('${r.id}')">
            🗑️
          </button>
        `;

        tr.innerHTML = `
          <td><strong>${r.id}</strong></td>
          <td style="white-space: nowrap;">${fechaStr}</td>
          <td>
            <strong>${r.clienteNombre}</strong><br>
            <small style="color: #64748b;">📱 ${r.clienteTel}</small>
          </td>
          <td>${badgeTipo}</td>
          <td>${detalleHtml}</td>
          <td style="max-width: 200px; font-size: 0.82rem; color: #475569;">
            ${r.observacion ? r.observacion : '<span style="color:#cbd5e1;">Sin notas</span>'}
          </td>
          <td class="text-right" style="font-weight: 700; color: #047857; white-space: nowrap;">
            ${formatearMonedaCOP(r.valor)}
          </td>
          <td class="text-center">
            <div class="table-actions">
              ${btnPdfHtml}
              ${btnWaHtml}
              ${btnEliminarHtml}
            </div>
          </td>
        `;

        tablaBody.appendChild(tr);
      });
    }

    // Actualizar contadores del pie de tabla
    conteoFiltrados.textContent = filtrados.length;
    conteoTotales.textContent = registros.length;
    totalVisibleValor.textContent = formatearMonedaCOP(sumaVisible);
  }

  // ==========================================================
  // GENERACIÓN DE PDF CON REMISIÓN Y CÓDIGO DE COMERCIO (COLOMBIA)
  // ==========================================================
  function generarPdfRemision(registroId) {
    const reg = registros.find(r => r.id === registroId);
    if (!reg) {
      alert('Registro no encontrado.');
      return;
    }

    // Verificar si jsPDF está disponible
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
      alert('El generador de PDF se está cargando o no hay conexión. Se abrirá la vista de impresión en su lugar.');
      imprimirRemisionNativa(reg);
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'letter'
      });

      const primaryColor = [2, 132, 199];   // #0284c7
      const darkColor = [15, 23, 42];       // #0f172a
      const grayColor = [100, 116, 139];    // #64748b

      // ENCABEZADO
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 216, 12, 'F');

      // INCORPORAR LOGO DE LA TIENDA EN EL PDF
      const logoEl = document.getElementById('brand-logo-img');
      let textStartX = 14;
      if (logoEl && logoEl.complete && logoEl.naturalWidth > 0) {
        try {
          doc.addImage(logoEl, 'PNG', 14, 16, 22, 22);
          textStartX = 40;
        } catch (e) {
          console.warn('No se pudo incrustar el logo en el PDF:', e);
        }
      }

      // TÍTULO DE LA TIENDA
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(...darkColor);
      doc.text('DOS RUEDAS BICICLETERÍA & TALLER', textStartX, 24);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...grayColor);
      doc.text('Especialistas en Mecánica de Precisión, Mantenimiento y Repuestos', textStartX, 29);
      doc.text('NIT: 901.458.789-2 | Tel: (601) 789 4512 - 315 789 4512 | Bogotá D.C. - Colombia', textStartX, 34);

      // CUADRO REMISIÓN DE SERVICIO
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(138, 16, 64, 22, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('ORDEN DE SERVICIO / REMISIÓN', 142, 22);
      doc.setFontSize(14);
      doc.setTextColor(...darkColor);
      doc.text(reg.id, 142, 30);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(`Fecha: ${reg.fecha.replace('T', ' ')}`, 142, 35);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 42, 202, 42);

      // DATOS DEL CLIENTE Y VEHÍCULO
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      doc.text('1. INFORMACIÓN DEL CLIENTE Y BICICLETA', 14, 48);

      const clienteData = [
        ['Cliente:', reg.clienteNombre, 'Tel / WhatsApp:', reg.clienteTel],
        ['Bicicleta / Ref:', reg.biciDetalle || 'No especificada', 'Tipo Atención:', reg.tipoAtencion.toUpperCase()]
      ];

      doc.autoTable({
        startY: 51,
        body: clienteData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2, textColor: [30, 41, 59] },
        columnStyles: {
          0: { fontStyle: 'bold', width: 30, textColor: [71, 85, 105] },
          1: { width: 68 },
          2: { fontStyle: 'bold', width: 32, textColor: [71, 85, 105] },
          3: { width: 58 }
        }
      });

      // TABLA DE DETALLE DE TRABAJOS Y REPUESTOS
      const currentY = doc.lastAutoTable.finalY + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. DETALLE DE TRABAJO REALIZADO Y COMPONENTES', 14, currentY);

      const itemsTabla = [];
      if (reg.tipoServicio) {
        itemsTabla.push(['Servicio Técnico', reg.tipoServicio, 'Mano de Obra Calificada', formatearMonedaCOP(reg.tipoAtencion === 'ambos' ? reg.valor * 0.5 : reg.valor)]);
      }
      if (reg.nombreRepuesto) {
        itemsTabla.push(['Repuesto Nuevo', `${reg.tipoRepuesto ? `[${reg.tipoRepuesto}] ` : ''}${reg.nombreRepuesto}`, 'Instalado / Probado', formatearMonedaCOP(reg.tipoAtencion === 'ambos' ? reg.valor * 0.5 : reg.valor)]);
      }

      doc.autoTable({
        startY: currentY + 3,
        head: [['Concepto', 'Descripción Detallada', 'Estado', 'Total']],
        body: itemsTabla,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { width: 35, fontStyle: 'bold' },
          1: { width: 95 },
          2: { width: 32 },
          3: { width: 26, halign: 'right', fontStyle: 'bold' }
        }
      });

      // TOTALIZADOR
      const tableFinalY = doc.lastAutoTable.finalY + 4;
      doc.setFillColor(248, 250, 252);
      doc.rect(130, tableFinalY, 72, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      doc.text('VALOR TOTAL (COP):', 133, tableFinalY + 7);
      doc.setTextColor(4, 120, 87);
      doc.text(formatearMonedaCOP(reg.valor), 200, tableFinalY + 7, { align: 'right' });

      // OBSERVACIONES DE INGRESO
      const obsY = tableFinalY + 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text('3. OBSERVACIONES DE ENTRADA / DIAGNÓSTICO:', 14, obsY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const textoObs = reg.observacion && reg.observacion.trim().length > 0
        ? reg.observacion
        : 'Bicicleta recibida para procedimiento técnico estándar. Sin observaciones adicionales reportadas al momento del ingreso.';
      doc.text(doc.splitTextToSize(textoObs, 188), 14, obsY + 5);

      // CLÁUSULAS SEGÚN EL CÓDIGO DE COMERCIO DE COLOMBIA
      const clausulasY = obsY + 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('TÉRMINOS LEGALES Y CONDICIONES DEL SERVICIO (CÓDIGO DE COMERCIO DE COLOMBIA Y LEY 1480 DE 2011)', 14, clausulasY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);

      const parrafosLegales = [
        '1. CONTRATO DE CONFECCIÓN DE OBRA Y GARANTÍA (Arts. 2056 y ss. C.Co. / Ley 1480 de 2011): Dos Ruedas garantiza la mano de obra del servicio técnico ejecutado por un término de treinta (30) días calendario a partir de la entrega. La garantía no ampara desgaste natural, desajustes provocados por caídas, accidentes, agua a presión o manipulación por terceros ajenos al taller.',
        '2. DEPÓSITO MERCANTIL Y CUSTODIA (Arts. 1170 y 1177 C.Co.): La bicicletería asume la tenencia del vehículo exclusivamente para el mantenimiento contratado. El cliente declara conocer y aceptar el inventario y estado físico reportado en este documento.',
        '3. OBLIGACIÓN DE RETIRO Y BODEGAJE (Art. 2060 C.Co.): Una vez notificado el cliente sobre la finalización del servicio por vía telefónica o WhatsApp, dispone de un término improrrogable de treinta (30) días calendario para su retiro. Vencido este plazo sin ser retirado el bien, se generará cobro por concepto de custodia y bodegaje diario de $5.000 COP.',
        '4. EXONERACIÓN POR DETERIORO PROLONGADO Y ABANDONO MERCANTIL: Superados noventa (90) días de permanencia sin retiro ni pago del servicio y bodegaje, el establecimiento no se hace responsable por el deterioro natural de compuestos de caucho, retenedores, lubricantes o sellantes, y podrá iniciar los trámites legales de disposición y cobro de acreencias conforme a la legislación comercial colombiana vigente.'
      ];

      let textoLineY = clausulasY + 4;
      parrafosLegales.forEach(parr => {
        const lineas = doc.splitTextToSize(parr, 188);
        doc.text(lineas, 14, textoLineY);
        textoLineY += (lineas.length * 3.2);
      });

      // ZONA DE FIRMAS
      const firmasY = Math.max(textoLineY + 8, 238);
      doc.setDrawColor(148, 163, 184);
      doc.line(20, firmasY, 90, firmasY);
      doc.line(125, firmasY, 195, firmasY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text('FIRMA CLIENTE / AUTORIZADO', 55, firmasY + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`C.C. ___________________ | Acepto condiciones`, 55, firmasY + 8, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('MECÁNICO / JEFE DE TALLER', 160, firmasY + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Dos Ruedas Taller Especializado', 160, firmasY + 8, { align: 'center' });

      // DESCARGAR PDF
      const nombreArchivo = `Remision_${reg.id}_${reg.clienteNombre.replace(/\s+/g, '_')}.pdf`;
      doc.save(nombreArchivo);

    } catch (err) {
      console.error('Error generando PDF con jsPDF:', err);
      imprimirRemisionNativa(reg);
    }
  }

  // Fallback nativo de impresión si el CDN no estuviera accesible
  function imprimirRemisionNativa(reg) {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remisión ${reg.id} - Dos Ruedas</title>
        <style>
          body { font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
          h1 { margin: 0; color: #0284c7; font-size: 22px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; text-align: left; }
          th { background: #f1f5f9; }
          .legal { font-size: 10px; color: #475569; margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
          .firmas { margin-top: 40px; display: flex; justify-content: space-between; }
          .firma-box { width: 45%; border-top: 1px solid #000; text-align: center; font-size: 12px; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DOS RUEDAS BICICLETERÍA & TALLER</h1>
          <p>Remisión de Servicio #${reg.id} &bull; Fecha: ${reg.fecha.replace('T', ' ')}</p>
        </div>
        <p><strong>Cliente:</strong> ${reg.clienteNombre} | <strong>Teléfono:</strong> ${reg.clienteTel}</p>
        <p><strong>Bicicleta:</strong> ${reg.biciDetalle || 'General'} | <strong>Tipo Atención:</strong> ${reg.tipoAtencion.toUpperCase()}</p>
        <table>
          <tr><th>Detalle del Trabajo</th><th>Repuestos</th><th>Total</th></tr>
          <tr>
            <td>${reg.tipoServicio || 'N/A'}</td>
            <td>${reg.nombreRepuesto ? `${reg.tipoRepuesto}: ${reg.nombreRepuesto}` : 'Ninguno'}</td>
            <td><strong>${formatearMonedaCOP(reg.valor)}</strong></td>
          </tr>
        </table>
        <p><strong>Observaciones:</strong> ${reg.observacion || 'Sin observaciones'}</p>
        <div class="legal">
          <strong>Condiciones Legales (Código de Comercio de Colombia - Arts. 2056, 1170, 2060):</strong>
          Garantía de servicio por 30 días calendario sobre mano de obra. La custodia del bien se limita a la reparación. Superados 30 días posteriores al aviso de entrega se causará bodegaje de $5.000 diarios. Pasados 90 días aplicará trámite de abandono mercantil.
        </div>
        <div class="firmas">
          <div class="firma-box">Firma Cliente / C.C.</div>
          <div class="firma-box">Taller Dos Ruedas</div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    ventana.document.close();
  }

  // ==========================================================
  // INTEGRACIÓN WHATSAPP (TEXTO PLANO CON RELACIÓN COMPLETA)
  // ==========================================================
  function abrirModalWhatsApp(registroId) {
    const reg = registros.find(r => r.id === registroId);
    if (!reg) return;

    registroSeleccionadoParaWA = reg;
    modalWaCliente.textContent = reg.clienteNombre;
    modalWaTel.textContent = reg.clienteTel;

    // Generar el mensaje en texto plano relacionando toda la información diligenciada
    const textoMensaje = generarTextoPlanoWhatsApp(reg);
    modalWaTexto.value = textoMensaje;

    // Sanitizar teléfono (añadir código de país +57 para Colombia si no lo tiene)
    let telLimpio = reg.clienteTel.replace(/\D/g, '');
    if (telLimpio.length === 10) {
      telLimpio = '57' + telLimpio; // Formato internacional Colombia (+57 300...)
    }

    const enlaceUrl = `https://api.whatsapp.com/send?phone=${telLimpio}&text=${encodeURIComponent(textoMensaje)}`;
    btnAbrirWa.href = enlaceUrl;

    modalWhatsapp.classList.remove('hidden');
  }

  function generarTextoPlanoWhatsApp(reg) {
    const fechaObj = new Date(reg.fecha);
    const fechaStr = isNaN(fechaObj.getTime())
      ? reg.fecha
      : fechaObj.toLocaleDateString('es-CO') + ' ' + fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    let detalleTipo = '';
    if (reg.tipoAtencion === 'venta') detalleTipo = 'Venta de Repuestos';
    else if (reg.tipoAtencion === 'servicio') detalleTipo = 'Servicio de Taller';
    else detalleTipo = 'Mantenimiento + Repuestos';

    let bloqueDetalle = '';
    if (reg.tipoServicio) {
      bloqueDetalle += `🛠️ *Servicio Solicitado:* ${reg.tipoServicio}\n`;
    }
    if (reg.nombreRepuesto) {
      bloqueDetalle += `📦 *Repuesto:* ${reg.nombreRepuesto} (${reg.tipoRepuesto || 'General'})\n`;
    }

    const mensaje = 
`🚲 *DOS RUEDAS BICICLETERÍA & TALLER* 🚲
¡Hola ${reg.clienteNombre}! Esperamos que estés muy bien.

Te compartimos la relación de tu orden en nuestro taller:

📋 *Orden N°:* ${reg.id}
📅 *Fecha:* ${fechaStr}
👤 *Cliente:* ${reg.clienteNombre}
📱 *Contacto:* ${reg.clienteTel}
${reg.biciDetalle ? `🚲 *Bicicleta:* ${reg.biciDetalle}\n` : ''}🏷️ *Tipo de Atención:* ${detalleTipo}
${bloqueDetalle}📝 *Observaciones / Diagnóstico:* ${reg.observacion ? reg.observacion : 'Sin observaciones reportadas'}
💰 *VALOR TOTAL:* ${formatearMonedaCOP(reg.valor)}

⚖️ *Nota:* Servicio garantizado por 30 días según el Código de Comercio de Colombia. Recuerda retirar tu bicicleta dentro del plazo establecido para evitar costos de custodia.

¡Muchas gracias por confiar en Dos Ruedas! Quedamos atentos a cualquier inquietud. 🚴‍♂️✨`;

    return mensaje;
  }

  function configurarEventosModal() {
    btnCerrarModal.addEventListener('click', () => {
      modalWhatsapp.classList.add('hidden');
    });

    modalWhatsapp.addEventListener('click', (e) => {
      if (e.target === modalWhatsapp) {
        modalWhatsapp.classList.add('hidden');
      }
    });

    // Copiar texto al portapapeles
    btnCopiarWa.addEventListener('click', () => {
      modalWaTexto.select();
      navigator.clipboard.writeText(modalWaTexto.value).then(() => {
        alert('📋 ¡Texto copiado al portapapeles con éxito!');
      }).catch(() => {
        document.execCommand('copy');
        alert('📋 Texto copiado.');
      });
    });

    // Actualizar link de WhatsApp en vivo si el usuario edita el texto en el textarea
    modalWaTexto.addEventListener('input', () => {
      if (!registroSeleccionadoParaWA) return;
      let telLimpio = registroSeleccionadoParaWA.clienteTel.replace(/\D/g, '');
      if (telLimpio.length === 10) telLimpio = '57' + telLimpio;
      btnAbrirWa.href = `https://api.whatsapp.com/send?phone=${telLimpio}&text=${encodeURIComponent(modalWaTexto.value)}`;
    });
  }

  // ==========================================================
  // ACCIONES GENERALES Y UTILIDADES
  // ==========================================================
  function eliminarRegistro(id) {
    if (confirm(`¿Estás seguro de que deseas eliminar el registro ${id}?`)) {
      registros = registros.filter(r => r.id !== id);
      guardarDatos();
      renderizarTodo();
    }
  }

  function configurarAccionesGenerales() {
    // Botón Cargar Datos Semilla (si existe)
    if (btnSeedData) {
      btnSeedData.addEventListener('click', () => {
        if (confirm('¿Deseas recargar los datos de prueba iniciales? Se agregarán si faltan.')) {
          registros = [...DATOS_SEMILLA];
          guardarDatos();
          renderizarTodo();
          alert('✅ Datos de prueba cargados correctamente.');
        }
      });
    }

    // Botón Exportar JSON de respaldo
    btnExportJson.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(registros, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DosRuedas_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function renderizarTodo() {
    actualizarDashboard();
    renderizarTabla();
  }

  // Exponer funciones globales para llamadas desde los botones en tabla
  window.DosRuedasApp = {
    generarPdfRemision,
    abrirModalWhatsApp,
    eliminarRegistro
  };

  // Arrancar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

