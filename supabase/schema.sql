-- ============================================================
-- SIBIM — Schema inicial
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
-- ============================================================

-- ── Usuarios ────────────────────────────────────────────────
-- NOTA: las contraseñas están en texto plano solo para demo.
-- En producción migrar a Supabase Auth o usar bcrypt.

create table if not exists users (
  id        text primary key,
  username  text unique not null,
  password  text not null,
  nombre    text not null,
  cargo     text not null,
  role      text not null check (role in ('admin', 'secretario', 'direccion')),
  area      text,
  created_at timestamptz default now()
);

-- ── Categorías ───────────────────────────────────────────────

create table if not exists categories (
  id          text primary key,
  nombre      text not null,
  descripcion text,
  color       text not null,
  icono       text not null,
  created_at  timestamptz default now()
);

-- ── Productos ────────────────────────────────────────────────

create table if not exists products (
  id                 text primary key,
  nombre             text not null,
  codigo             text unique not null,
  descripcion        text,
  categoria_id       text references categories(id) on delete set null,
  precio_compra      numeric not null default 0,
  precio_venta       numeric not null default 0,
  stock_actual       integer not null default 0,
  stock_minimo       integer not null default 0,
  stock_maximo       integer not null default 0,
  unidad             text not null,
  proveedor          text,
  fecha_vencimiento  date,
  foto_url           text,
  ubicacion          text,
  area               text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists idx_products_area         on products(area);
create index if not exists idx_products_categoria_id on products(categoria_id);
create index if not exists idx_products_codigo       on products(codigo);

-- ── Movimientos ──────────────────────────────────────────────

create table if not exists movements (
  id             text primary key,
  producto_id    text references products(id) on delete cascade,
  tipo           text not null check (tipo in ('entrada','salida','ajuste','transferencia')),
  cantidad       integer not null,
  stock_anterior integer not null,
  stock_nuevo    integer not null,
  motivo         text,
  referencia     text,
  usuario_id     text references users(id) on delete set null,
  usuario_nombre text not null,
  created_at     timestamptz default now()
);

create index if not exists idx_movements_producto_id on movements(producto_id);
create index if not exists idx_movements_created_at  on movements(created_at desc);

-- ============================================================
-- SEED — Usuarios
-- ============================================================

insert into users (id, username, password, nombre, cargo, role, area) values
  ('admin',                    'admin',      'Admin#2026',      'Superusuario',                        'Administrador del sistema',                                                             'admin',      null),
  ('sec-general',              'jm.zuniga',  'Secretario#2026', 'José Manuel Zúñiga Guerrero',         'Secretario General Municipal',                                                          'secretario', 'Secretaría General Municipal'),
  ('sec-tesoreria',            'r.martinez', 'Secretario#2026', 'Rubén Martínez Sánchez',              'Secretario de Tesorería Municipal',                                                     'secretario', 'Secretaría de Tesorería Municipal'),
  ('sec-obras',                'ia.lugo',    'Secretario#2026', 'Iván Arturo Lugo Martín',             'Secretario de Obras Públicas y Desarrollo Urbano',                                      'secretario', 'Secretaría de Obras Públicas y Desarrollo Urbano'),
  ('sec-planeacion',           'r.barrera',  'Secretario#2026', 'Rigoberto Barrera Roldán',            'Secretario de Planeación y Evaluación',                                                 'secretario', 'Secretaría de Planeación y Evaluación'),
  ('sec-desarrollo-economico', 'l.ocampo',   'Secretario#2026', 'Lucila Ocampo Valle',                 'Secretaria de Desarrollo Económico y Turismo',                                          'secretario', 'Secretaría de Desarrollo Económico y Turismo'),
  ('sec-bienestar',            's.vargas',   'Secretario#2026', 'Socorro Vargas Chávez',               'Secretaria de Bienestar Social',                                                        'secretario', 'Secretaría de Bienestar Social'),
  ('sec-seguridad',            'd.morelos',  'Secretario#2026', 'Diadymir Morelos Esquivel',           'Secretaria de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil',  'secretario', 'Secretaría de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil'),
  ('sec-pueblos-indigenas',    'la.patricio','Secretario#2026', 'Lupita Anneth Patricio Reyes',        'Secretaria de Desarrollo para Pueblos y Comunidades Indígenas',                         'secretario', 'Secretaría de Desarrollo para Pueblos y Comunidades Indígenas'),
  ('administracion',           'l.jimenez',  'Direccion#2026',  'Laura Jiménez Ortiz',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Administración'),
  ('rh-nomina',                'm.torres',   'Direccion#2026',  'Miguel Ángel Torres',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Recursos Humanos y Nómina'),
  ('archivo',                  'p.solis',    'Direccion#2026',  'Patricia Solís Ramos',                'Responsable de bienes',                                                                 'direccion',  'Dirección del Área Coordinadora de Archivo'),
  ('proteccion-civil',         'h.ramirez',  'Direccion#2026',  'Héctor Ramírez Cano',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Protección Civil y Bomberos'),
  ('servicios-publicos',       'j.bautista', 'Direccion#2026',  'Jorge Luis Bautista',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Servicios Públicos y Limpias'),
  ('tecnologias-info',         'a.castillo', 'Direccion#2026',  'Andrea Castillo Vega',                'Responsable de bienes',                                                                 'direccion',  'Dirección de Tecnologías de la Información'),
  ('catastro',                 'r.nava',     'Direccion#2026',  'Roberto Nava Cruz',                   'Responsable de bienes',                                                                 'direccion',  'Dirección de Catastro'),
  ('correspondencia',          'g.reyes',    'Direccion#2026',  'Gabriela Reyes Molina',               'Responsable de bienes',                                                                 'direccion',  'Unidad Central de Correspondencia'),
  ('gobierno',                 'f.aguilar',  'Direccion#2026',  'Fernando Aguilar Ponce',              'Responsable de bienes',                                                                 'direccion',  'Dirección de Gobierno'),
  ('obras-publicas',           'r.dominguez','Direccion#2026',  'Ricardo Domínguez Silva',             'Responsable de bienes',                                                                 'direccion',  'Dirección de Obras Públicas'),
  ('servicios-municipales',    'c.herrera',  'Direccion#2026',  'Claudia Herrera Luna',                'Responsable de bienes',                                                                 'direccion',  'Dirección de Servicios Municipales'),
  ('logistica-eventos',        's.mendoza',  'Direccion#2026',  'Sofía Mendoza Ríos',                  'Responsable de bienes',                                                                 'direccion',  'Dirección de Logística y Eventos'),
  ('comunicacion-social',      'd.cortes',   'Direccion#2026',  'Daniel Cortés Salinas',               'Responsable de bienes',                                                                 'direccion',  'Dirección de Comunicación Social y Marketing Digital')
on conflict (id) do nothing;

-- ============================================================
-- SEED — Categorías
-- ============================================================

insert into categories (id, nombre, descripcion, color, icono, created_at) values
  ('1', 'Mobiliario',              'Escritorios, sillas y archiveros',        '#8B5CF6', 'Armchair',    '2024-01-01'),
  ('2', 'Vehículos',               'Unidades y flotilla municipal',            '#3B82F6', 'Car',         '2024-01-01'),
  ('3', 'Equipo de Cómputo',       'Laptops, PCs y periféricos',              '#10B981', 'Laptop',      '2024-01-01'),
  ('4', 'Equipo de Oficina',       'Impresoras, copiadoras y consumibles',    '#F59E0B', 'Printer',     '2024-01-01'),
  ('5', 'Herramientas y Maquinaria','Maquinaria pesada y herramientas',       '#EF4444', 'Wrench',      '2024-01-01'),
  ('6', 'Equipo Audiovisual',      'Cámaras, proyectores y audio',            '#EC4899', 'VideoCamera', '2024-01-01')
on conflict (id) do nothing;

-- ============================================================
-- SEED — Productos
-- ============================================================

insert into products (id, nombre, codigo, descripcion, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo, unidad, proveedor, fecha_vencimiento, ubicacion, area, created_at, updated_at) values
  ('1',  'Escritorio ejecutivo de madera',    'MB-001', 'Escritorio ejecutivo con cajonera lateral',           '1', 3200,    2800,    18, 10, 40, 'pieza',  'Muebles Ejecutivos S.A.',              null,         'Palacio Municipal, Piso 2',      'Dirección de Administración',                                                                       '2024-01-10', '2024-12-01'),
  ('2',  'Silla ejecutiva ergonómica',        'MB-002', 'Silla giratoria con soporte lumbar',                  '1', 2400,    2100,     6, 15, 60, 'pieza',  'Muebles Ejecutivos S.A.',              null,         'Palacio Municipal, Piso 1',      'Dirección de Recursos Humanos y Nómina',                                                            '2024-01-10', '2024-12-01'),
  ('3',  'Archivero metálico 4 gavetas',      'MB-003', 'Archivero de acero con cerradura',                    '1', 1800,    1500,     0,  5, 20, 'pieza',  'Comercializadora de Oficina del Centro',null,         'Bodega Municipal',               'Dirección del Área Coordinadora de Archivo',                                                        '2024-01-10', '2024-12-01'),
  ('4',  'Camioneta pick-up Ford Ranger',     'VH-001', 'Unidad doble cabina 4x4',                             '2', 620000,  540000,   1,  1,  1, 'unidad', 'Ford Comercial Puebla',                null,         'Corralón Municipal',             'Dirección de Protección Civil y Bomberos',                                                          '2024-01-10', '2024-12-01'),
  ('5',  'Patrulla Nissan Versa',             'VH-002', 'Unidad de patrullaje equipada',                       '2', 380000,  310000,   3,  2,  5, 'unidad', 'Nissan Flotillas',                     null,         'Corralón Municipal',             'Secretaría de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil',              '2024-01-10', '2024-12-01'),
  ('6',  'Camión recolector de basura',       'VH-003', 'Compactador de carga trasera',                        '2', 1850000, 1600000,  1,  1,  2, 'unidad', 'Volvo Camiones del Bajío',             null,         'Central Camionera Municipal',    'Dirección de Servicios Públicos y Limpias',                                                         '2024-01-10', '2024-12-01'),
  ('7',  'Laptop Dell Latitude 5440',         'EC-001', 'Equipo de cómputo portátil corporativo',              '3', 18500,   15200,   12, 10, 50, 'pieza',  'Grupo TI Soluciones',                 '2027-08-02', 'Palacio Municipal, Piso 3',      'Dirección de Tecnologías de la Información',                                                        '2024-01-10', '2024-12-01'),
  ('8',  'Computadora de escritorio HP',      'EC-002', 'Equipo de cómputo de escritorio con monitor',         '3', 12000,   9500,     4,  8, 30, 'pieza',  'Distribuidora de Cómputo Nacional',   null,         'Palacio Municipal, Piso 1',      'Dirección de Catastro',                                                                             '2024-01-10', '2024-12-01'),
  ('9',  'Impresora multifuncional Epson',    'EO-001', 'Impresora, escáner y copiado a color',                '4', 8500,    6800,     2,  3, 10, 'pieza',  'Office Depot Gobierno',               '2027-08-01', 'Palacio Municipal, Planta Baja', 'Unidad Central de Correspondencia',                                                                 '2024-01-10', '2024-12-01'),
  ('10', 'Fotocopiadora Xerox industrial',    'EO-002', 'Copiado de alto volumen',                             '4', 45000,   32000,    0,  2,  6, 'pieza',  'Xerox México',                        null,         'Palacio Municipal, Piso 1',      'Dirección de Gobierno',                                                                             '2024-01-10', '2024-12-01'),
  ('11', 'Retroexcavadora CAT 420',           'HM-001', 'Maquinaria pesada para obra pública',                 '5', 2400000, 2100000,  1,  1,  1, 'unidad', 'Maquinaria Pesada CAT Puebla',        null,         'Almacén de Obras Públicas',      'Dirección de Obras Públicas',                                                                       '2024-01-10', '2024-12-01'),
  ('12', 'Podadora industrial autopropulsada','HM-002', 'Equipo para mantenimiento de áreas verdes',           '5', 15500,   12800,    5,  4, 15, 'unidad', 'Jardinería y Equipos S.A.',           null,         'Bodega Municipal',               'Dirección de Servicios Municipales',                                                                '2024-01-10', '2024-12-01'),
  ('13', 'Cámara de videovigilancia PTZ',     'AV-001', 'Cámara motorizada para eventos y monitoreo',          '6', 4200,    3600,    22, 10, 40, 'pieza',  'Seguritech Videovigilancia',          null,         'Bodega Municipal',               'Dirección de Logística y Eventos',                                                                  '2024-01-10', '2024-12-01'),
  ('14', 'Proyector Epson PowerLite',         'AV-002', 'Proyector para salas de juntas y eventos',            '6', 22000,   17500,    3,  5, 15, 'pieza',  'Proyecta AV México',                 '2027-08-03', 'Palacio Municipal, Piso 2',      'Dirección de Comunicación Social y Marketing Digital',                                               '2024-01-10', '2024-12-01')
on conflict (id) do nothing;

-- ============================================================
-- SEED — Movimientos
-- ============================================================

insert into movements (id, producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia, usuario_id, usuario_nombre, created_at) values
  ('1', '7',  'entrada',      5, 7,  12, 'Alta por compra',                 'OC-2026-014',  'admin', 'Admin',      '2026-07-29T09:00:00'),
  ('2', '2',  'salida',       9, 15,  6, 'Reasignación entre direcciones',  'RES-2026-031', 'admin', 'Admin',      '2026-07-29T10:30:00'),
  ('3', '10', 'salida',       2,  2,  0, 'Baja por obsolescencia',          'BAJ-2026-006', 'admin', 'Empleado 1', '2026-07-29T11:15:00'),
  ('4', '13', 'ajuste',       4, 18, 22, 'Corrección de inventario físico', 'AJU-2026-011', 'admin', 'Admin',      '2026-07-28T16:00:00')
on conflict (id) do nothing;
