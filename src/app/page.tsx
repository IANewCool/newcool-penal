'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'inicio' | 'calculadora' | 'beneficios' | 'procedimiento' | 'recursos';

// Escala de penas del Codigo Penal chileno
const PENAS = [
  { id: 'prision', nombre: 'Prision', minDias: 1, maxDias: 60, tipo: 'leve' },
  { id: 'presidio-menor-min', nombre: 'Presidio Menor Grado Minimo', minDias: 61, maxDias: 540, tipo: 'menor' },
  { id: 'presidio-menor-med', nombre: 'Presidio Menor Grado Medio', minDias: 541, maxDias: 1095, tipo: 'menor' },
  { id: 'presidio-menor-max', nombre: 'Presidio Menor Grado Maximo', minDias: 1096, maxDias: 1825, tipo: 'menor' },
  { id: 'presidio-mayor-min', nombre: 'Presidio Mayor Grado Minimo', minDias: 1826, maxDias: 3650, tipo: 'mayor' },
  { id: 'presidio-mayor-med', nombre: 'Presidio Mayor Grado Medio', minDias: 3651, maxDias: 5475, tipo: 'mayor' },
  { id: 'presidio-mayor-max', nombre: 'Presidio Mayor Grado Maximo', minDias: 5476, maxDias: 7300, tipo: 'mayor' },
  { id: 'perpetuo', nombre: 'Presidio Perpetuo', minDias: 7301, maxDias: 14600, tipo: 'perpetuo' },
  { id: 'perpetuo-calificado', nombre: 'Presidio Perpetuo Calificado', minDias: 14601, maxDias: 18250, tipo: 'perpetuo-calif' },
];

const DELITOS_COMUNES = [
  { nombre: 'Hurto simple (< 1/2 UTM)', pena: 'prision' },
  { nombre: 'Hurto simple (1/2 - 4 UTM)', pena: 'presidio-menor-min' },
  { nombre: 'Hurto simple (4 - 40 UTM)', pena: 'presidio-menor-med' },
  { nombre: 'Robo con fuerza (lugar habitado)', pena: 'presidio-mayor-min' },
  { nombre: 'Robo con violencia', pena: 'presidio-mayor-min' },
  { nombre: 'Robo con intimidacion', pena: 'presidio-mayor-min' },
  { nombre: 'Lesiones menos graves', pena: 'presidio-menor-min' },
  { nombre: 'Lesiones graves', pena: 'presidio-menor-med' },
  { nombre: 'Lesiones gravisimas', pena: 'presidio-mayor-min' },
  { nombre: 'Homicidio simple', pena: 'presidio-mayor-med' },
  { nombre: 'Homicidio calificado', pena: 'presidio-mayor-max' },
  { nombre: 'Parricidio', pena: 'presidio-mayor-max' },
  { nombre: 'Femicidio', pena: 'presidio-mayor-max' },
  { nombre: 'Violacion (mayor de 14)', pena: 'presidio-mayor-min' },
  { nombre: 'Violacion (menor de 14)', pena: 'presidio-mayor-med' },
  { nombre: 'Trafico de drogas (pequena cantidad)', pena: 'presidio-menor-med' },
  { nombre: 'Trafico de drogas', pena: 'presidio-mayor-min' },
  { nombre: 'Estafa', pena: 'presidio-menor-med' },
  { nombre: 'Manejo en estado de ebriedad', pena: 'presidio-menor-min' },
];

function diasATexto(dias: number): string {
  if (dias >= 365) {
    const anos = Math.floor(dias / 365);
    const diasRestantes = dias % 365;
    if (diasRestantes > 0) {
      return `${anos} año${anos > 1 ? 's' : ''} y ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
    }
    return `${anos} año${anos > 1 ? 's' : ''}`;
  }
  return `${dias} dia${dias > 1 ? 's' : ''}`;
}

function PenasCalculator() {
  const [penaSeleccionada, setPenaSeleccionada] = useState<string>('');
  const [atenuantes, setAtenuantes] = useState<number>(0);
  const [agravantes, setAgravantes] = useState<number>(0);
  const [tiempoServido, setTiempoServido] = useState<string>('');
  const [resultado, setResultado] = useState<{
    penaBase: string;
    penaFinal: string;
    rangoMin: number;
    rangoMax: number;
    libertadCondicional: number;
    tiempoRestante: number;
  } | null>(null);

  const calcularPena = () => {
    if (!penaSeleccionada) return;

    const pena = PENAS.find(p => p.id === penaSeleccionada);
    if (!pena) return;

    let indiceActual = PENAS.findIndex(p => p.id === penaSeleccionada);
    const diferencia = atenuantes - agravantes;

    // Modificar grado segun atenuantes/agravantes
    let nuevoIndice = indiceActual - diferencia;
    nuevoIndice = Math.max(0, Math.min(PENAS.length - 1, nuevoIndice));

    const penaFinal = PENAS[nuevoIndice];
    const tiempoServidoDias = parseInt(tiempoServido) || 0;

    // Calcular libertad condicional (mitad de la pena para delitos simples)
    const penaPromedio = Math.floor((penaFinal.minDias + penaFinal.maxDias) / 2);
    let libertadCondicional = Math.floor(penaPromedio / 2);

    // Para presidio perpetuo, son 20 años; para perpetuo calificado, 40 años
    if (penaFinal.tipo === 'perpetuo') {
      libertadCondicional = 7300; // 20 años
    } else if (penaFinal.tipo === 'perpetuo-calif') {
      libertadCondicional = 14600; // 40 años
    }

    const tiempoRestante = Math.max(0, libertadCondicional - tiempoServidoDias);

    setResultado({
      penaBase: pena.nombre,
      penaFinal: penaFinal.nombre,
      rangoMin: penaFinal.minDias,
      rangoMax: penaFinal.maxDias,
      libertadCondicional,
      tiempoRestante,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
        <span>⚖️</span> Calculadora de Penas
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Pena Base del Delito</label>
            <select
              value={penaSeleccionada}
              onChange={(e) => setPenaSeleccionada(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Seleccione una pena</option>
              {PENAS.map((pena) => (
                <option key={pena.id} value={pena.id}>
                  {pena.nombre} ({diasATexto(pena.minDias)} - {diasATexto(pena.maxDias)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Circunstancias Atenuantes</label>
            <select
              value={atenuantes}
              onChange={(e) => setAtenuantes(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={0}>Ninguna</option>
              <option value={1}>1 atenuante (rebaja 1 grado)</option>
              <option value={2}>2 o mas atenuantes (rebaja 2 grados)</option>
              <option value={3}>Atenuante muy calificada (rebaja 3 grados)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Circunstancias Agravantes</label>
            <select
              value={agravantes}
              onChange={(e) => setAgravantes(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={0}>Ninguna</option>
              <option value={1}>1 agravante (sube 1 grado)</option>
              <option value={2}>2 o mas agravantes (sube 2 grados)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Tiempo Servido (dias)</label>
            <input
              type="number"
              value={tiempoServido}
              onChange={(e) => setTiempoServido(e.target.value)}
              placeholder="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={calcularPena}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Calcular Pena
          </button>
        </div>

        <div className="space-y-4">
          {resultado && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg p-6 space-y-4"
            >
              <h3 className="text-lg font-semibold text-red-400 mb-4">Resultado del Calculo</h3>

              <div className="space-y-3">
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-gray-400 text-sm">Pena Base</p>
                  <p className="text-white font-bold">{resultado.penaBase}</p>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-gray-400 text-sm">Pena Aplicable</p>
                  <p className="text-red-400 font-bold">{resultado.penaFinal}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-gray-400 text-sm">Rango Minimo</p>
                    <p className="text-white font-bold">{diasATexto(resultado.rangoMin)}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-gray-400 text-sm">Rango Maximo</p>
                    <p className="text-white font-bold">{diasATexto(resultado.rangoMax)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="bg-green-900/30 border border-green-700 rounded p-3">
                    <p className="text-green-400 text-sm">Libertad Condicional (mitad pena)</p>
                    <p className="text-green-400 font-bold text-lg">{diasATexto(resultado.libertadCondicional)}</p>
                  </div>
                </div>

                {parseInt(tiempoServido) > 0 && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded p-3">
                    <p className="text-blue-400 text-sm">Tiempo Restante para L.C.</p>
                    <p className="text-blue-400 font-bold text-lg">
                      {resultado.tiempoRestante > 0 ? diasATexto(resultado.tiempoRestante) : 'Ya cumple requisito'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">Atenuantes Comunes (Art. 11 CP)</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Irreprochable conducta anterior</li>
              <li>• Reparar el mal causado</li>
              <li>• Colaboracion sustancial</li>
              <li>• Obrar por estimulos poderosos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de delitos comunes */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Referencia: Delitos Comunes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-3 text-gray-400">Delito</th>
                <th className="py-2 px-3 text-gray-400">Pena Base</th>
              </tr>
            </thead>
            <tbody>
              {DELITOS_COMUNES.map((delito, i) => {
                const pena = PENAS.find(p => p.id === delito.pena);
                return (
                  <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-2 px-3 text-white">{delito.nombre}</td>
                    <td className="py-2 px-3 text-red-400">{pena?.nombre || delito.pena}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function InicioView() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-900/50 to-gray-900/50 rounded-xl p-8 border border-red-700"
      >
        <h1 className="text-3xl font-bold text-red-400 mb-4">Derecho Penal</h1>
        <p className="text-gray-300 text-lg">
          Informacion sobre el sistema penal chileno, calculadora de penas, beneficios intrapenitenciarios y procedimientos.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: '⚖️', title: 'Calculadora de Penas', desc: 'Calcula rangos de penas con atenuantes y agravantes' },
          { icon: '🔓', title: 'Beneficios', desc: 'Libertad condicional, salidas y reduccion de condena' },
          { icon: '📋', title: 'Procedimiento', desc: 'Etapas del proceso penal chileno' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <span className="text-4xl">{item.icon}</span>
            <h3 className="text-xl font-semibold text-white mt-4">{item.title}</h3>
            <p className="text-gray-400 mt-2">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-red-400 mb-4">Escala General de Penas (Art. 21 CP)</h2>
        <div className="space-y-2">
          {PENAS.map((pena, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-700/30 rounded px-4 py-2">
              <span className="text-white">{pena.nombre}</span>
              <span className="text-red-400 text-sm">{diasATexto(pena.minDias)} - {diasATexto(pena.maxDias)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeneficiosView() {
  const beneficios = [
    {
      nombre: 'Libertad Condicional',
      requisito: 'Mitad de la condena (o 2/3 en casos graves)',
      descripcion: 'Cumplir el resto de la pena en libertad con condiciones',
    },
    {
      nombre: 'Salida Controlada al Medio Libre',
      requisito: '1/3 de la condena',
      descripcion: 'Salidas diarias para trabajar o estudiar',
    },
    {
      nombre: 'Salida de Fin de Semana',
      requisito: '1/3 de la condena',
      descripcion: 'Salida desde viernes tarde hasta domingo noche',
    },
    {
      nombre: 'Salida Dominical',
      requisito: '2/3 de la pena cumplida',
      descripcion: 'Salida los dias domingo',
    },
    {
      nombre: 'Rebaja de Condena',
      requisito: 'Buena conducta',
      descripcion: '2 meses por cada año de condena efectivamente cumplido',
    },
    {
      nombre: 'Indulto Particular',
      requisito: 'Solicitud al Presidente',
      descripcion: 'Perdon de la pena por gracia presidencial',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-red-400 mb-6">Beneficios Intrapenitenciarios</h2>

        <div className="space-y-4">
          {beneficios.map((b, i) => (
            <div key={i} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">{b.nombre}</h3>
                  <p className="text-gray-400 text-sm mt-1">{b.descripcion}</p>
                </div>
                <span className="bg-red-900/50 text-red-400 px-3 py-1 rounded text-sm">
                  {b.requisito}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">Requisitos Generales</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Buena conducta calificada por Gendarmeria</li>
          <li>• Participacion en programas de reinsercion</li>
          <li>• Informe favorable del Consejo Tecnico</li>
          <li>• No tener proceso pendiente</li>
        </ul>
      </div>
    </motion.div>
  );
}

function ProcedimientoView() {
  const etapas = [
    { nombre: 'Denuncia/Querella', descripcion: 'Inicio del proceso ante fiscalia o tribunal', duracion: 'Inmediato' },
    { nombre: 'Investigacion', descripcion: 'Fiscalia investiga los hechos', duracion: '2 años maximo' },
    { nombre: 'Formalizacion', descripcion: 'Fiscalia comunica cargos al imputado', duracion: 'En audiencia' },
    { nombre: 'Medidas Cautelares', descripcion: 'Prision preventiva u otras medidas', duracion: 'Variable' },
    { nombre: 'Acusacion', descripcion: 'Fiscalia presenta acusacion formal', duracion: 'Cierre investigacion' },
    { nombre: 'Preparacion Juicio', descripcion: 'Audiencia para fijar pruebas', duracion: '1 audiencia' },
    { nombre: 'Juicio Oral', descripcion: 'Se presenta prueba ante tribunal', duracion: '1-5 dias' },
    { nombre: 'Sentencia', descripcion: 'Tribunal dicta condena o absolucion', duracion: 'Inmediata' },
    { nombre: 'Recursos', descripcion: 'Nulidad o apelacion', duracion: '10 dias' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-red-400 mb-6">Etapas del Proceso Penal</h2>

        <div className="relative">
          {etapas.map((etapa, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                {i < etapas.length - 1 && <div className="w-0.5 h-full bg-gray-600 mt-2" />}
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-semibold">{etapa.nombre}</h3>
                  <span className="text-red-400 text-sm">{etapa.duracion}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{etapa.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <h4 className="text-green-400 font-semibold mb-2">Salidas Alternativas</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Suspension condicional del procedimiento</li>
            <li>• Acuerdo reparatorio</li>
            <li>• Principio de oportunidad</li>
            <li>• Procedimiento abreviado</li>
          </ul>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Derechos del Imputado</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Derecho a guardar silencio</li>
            <li>• Derecho a defensa letrada</li>
            <li>• Presuncion de inocencia</li>
            <li>• Derecho a conocer los cargos</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function RecursosView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-red-400 mb-6">Recursos Utiles</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: 'Defensoria Penal Publica', url: 'https://www.dpp.cl', desc: 'Defensa gratuita para imputados' },
            { name: 'Ministerio Publico', url: 'https://www.fiscaliadechile.cl', desc: 'Fiscalia y persecucion penal' },
            { name: 'Gendarmeria de Chile', url: 'https://www.gendarmeria.gob.cl', desc: 'Sistema penitenciario' },
            { name: 'Poder Judicial', url: 'https://www.pjud.cl', desc: 'Consulta de causas penales' },
          ].map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition-colors"
            >
              <h3 className="text-red-400 font-semibold">{r.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{r.desc}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Telefonos de Emergencia</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { nombre: 'Carabineros', telefono: '133', icon: '👮' },
            { nombre: 'PDI', telefono: '134', icon: '🔍' },
            { nombre: 'Fiscalia', telefono: '600 333 0000', icon: '⚖️' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-700/30 rounded-lg p-4 text-center">
              <span className="text-3xl">{t.icon}</span>
              <p className="text-white font-semibold mt-2">{t.nombre}</p>
              <p className="text-red-400 font-bold text-xl">{t.telefono}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Legislacion Principal</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Codigo Penal',
            'Codigo Procesal Penal',
            'Ley 18.216 (Penas Sustitutivas)',
            'Ley 20.084 (Resp. Penal Adolescente)',
            'Ley 20.000 (Drogas)',
            'Ley 19.696 (CPP)',
          ].map((ley, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-300 bg-gray-700/30 rounded px-3 py-2">
              <span className="text-red-500">📜</span>
              {ley}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function PenalModule() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'calculadora', label: 'Calculadora', icon: '⚖️' },
    { id: 'beneficios', label: 'Beneficios', icon: '🔓' },
    { id: 'procedimiento', label: 'Procedimiento', icon: '📋' },
    { id: 'recursos', label: 'Recursos', icon: '🔗' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚖️</span>
              <div>
                <h1 className="text-xl font-bold text-white">Derecho Penal</h1>
                <p className="text-sm text-gray-400">NewCooltura Informada</p>
              </div>
            </div>
            <a
              href="https://newcool-informada.vercel.app"
              className="text-red-400 hover:text-red-300 text-sm"
            >
              ← Volver al Hub
            </a>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-400 border-red-400'
                    : 'text-gray-400 border-transparent hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && <InicioView key="inicio" />}
          {activeTab === 'calculadora' && <PenasCalculator key="calculadora" />}
          {activeTab === 'beneficios' && <BeneficiosView key="beneficios" />}
          {activeTab === 'procedimiento' && <ProcedimientoView key="procedimiento" />}
          {activeTab === 'recursos' && <RecursosView key="recursos" />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>Esta informacion es referencial. Consulte siempre con un abogado defensor.</p>
          <p className="mt-2">NewCooltura Informada - Derecho Penal</p>
        </div>
      </footer>
    </div>
  );
}
