-- ============================================================
-- SIBIM — Schema inicial
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
-- ============================================================

-- Necesario para bcrypt en el seed (compatible con bcryptjs del servidor).
create extension if not exists pgcrypto;

-- ── Usuarios ────────────────────────────────────────────────

create table if not exists users (
  id         text primary key,
  username   text unique not null,
  password   text not null,            -- bcrypt hash ($2a$/2b$)
  nombre     text not null,
  cargo      text not null,
  role       text not null check (role in ('admin', 'secretario', 'direccion')),
  area       text,
  foto_url   text,
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
create index if not exists idx_movements_usuario_id  on movements(usuario_id);

-- ── Funciones atómicas para movimientos ─────────────────────────────────────
-- Ejecutan INSERT + UPDATE en una sola transacción para evitar que el stock
-- quede inconsistente si la segunda operación falla.

create or replace function add_movement_atomic(
  p_id             text,
  p_producto_id    text,
  p_tipo           text,
  p_cantidad       integer,
  p_stock_anterior integer,
  p_stock_nuevo    integer,
  p_motivo         text,
  p_referencia     text,
  p_usuario_id     text,
  p_usuario_nombre text,
  p_created_at     timestamptz
) returns void language plpgsql as $$
begin
  insert into movements (id, producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia, usuario_id, usuario_nombre, created_at)
  values (p_id, p_producto_id, p_tipo, p_cantidad, p_stock_anterior, p_stock_nuevo, p_motivo, p_referencia, p_usuario_id, p_usuario_nombre, p_created_at);

  update products
  set stock_actual = p_stock_nuevo, updated_at = now()
  where id = p_producto_id;
end;
$$;

create or replace function delete_movement_atomic(
  p_id             text,
  p_producto_id    text,
  p_stock_anterior integer
) returns void language plpgsql as $$
begin
  delete from movements where id = p_id;

  update products
  set stock_actual = p_stock_anterior, updated_at = now()
  where id = p_producto_id;
end;
$$;

-- ============================================================
-- SEED — Usuarios
-- Las contraseñas se hashean con bcrypt (pgcrypto). El servidor
-- las verifica con bcryptjs, que es compatible con el prefijo $2a$.
-- ============================================================

insert into users (id, username, password, nombre, cargo, role, area, foto_url) values
  ('admin',                    'admin',       crypt('Admin#2026',      gen_salt('bf', 10)), 'Superusuario',                        'Administrador del sistema',                                                             'admin',      null,                                                                                                            null),
  ('sec-general',              'jm.zuniga',   crypt('Secretario#2026', gen_salt('bf', 10)), 'José Manuel Zúñiga Guerrero',         'Secretario General Municipal',                                                          'secretario', 'Secretaría General Municipal',                                                                                  null),
  ('sec-tesoreria',            'r.martinez',  crypt('Secretario#2026', gen_salt('bf', 10)), 'Rubén Martínez Sánchez',              'Secretario de Tesorería Municipal',                                                     'secretario', 'Secretaría de Tesorería Municipal',                                                                             null),
  ('sec-obras',                'ia.lugo',     crypt('Secretario#2026', gen_salt('bf', 10)), 'Iván Arturo Lugo Martín',             'Secretario de Obras Públicas y Desarrollo Urbano',                                      'secretario', 'Secretaría de Obras Públicas y Desarrollo Urbano',                                                              null),
  ('sec-planeacion',           'r.barrera',   crypt('Secretario#2026', gen_salt('bf', 10)), 'Rigoberto Barrera Roldán',            'Secretario de Planeación y Evaluación',                                                 'secretario', 'Secretaría de Planeación y Evaluación',                                                                         null),
  ('sec-desarrollo-economico', 'l.ocampo',    crypt('Secretario#2026', gen_salt('bf', 10)), 'Lucila Ocampo Valle',                 'Secretaria de Desarrollo Económico y Turismo',                                          'secretario', 'Secretaría de Desarrollo Económico y Turismo',                                                                  null),
  ('sec-bienestar',            's.vargas',    crypt('Secretario#2026', gen_salt('bf', 10)), 'Socorro Vargas Chávez',               'Secretaria de Bienestar Social',                                                        'secretario', 'Secretaría de Bienestar Social',                                                                                null),
  ('sec-seguridad',            'd.morelos',   crypt('Secretario#2026', gen_salt('bf', 10)), 'Diadymir Morelos Esquivel',           'Secretaria de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil',  'secretario', 'Secretaría de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil',                           null),
  ('sec-pueblos-indigenas',    'la.patricio', crypt('Secretario#2026', gen_salt('bf', 10)), 'Lupita Anneth Patricio Reyes',        'Secretaria de Desarrollo para Pueblos y Comunidades Indígenas',                         'secretario', 'Secretaría de Desarrollo para Pueblos y Comunidades Indígenas',                                                 null),
  ('administracion',           'l.jimenez',   crypt('Direccion#2026',  gen_salt('bf', 10)), 'Laura Jiménez Ortiz',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Administración',                                                                                   null),
  ('rh-nomina',                'm.torres',    crypt('Direccion#2026',  gen_salt('bf', 10)), 'Miguel Ángel Torres',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Recursos Humanos y Nómina',                                                                        null),
  ('archivo',                  'p.solis',     crypt('Direccion#2026',  gen_salt('bf', 10)), 'Patricia Solís Ramos',                'Responsable de bienes',                                                                 'direccion',  'Dirección del Área Coordinadora de Archivo',                                                                    null),
  ('proteccion-civil',         'h.ramirez',   crypt('Direccion#2026',  gen_salt('bf', 10)), 'Héctor Ramírez Cano',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Protección Civil y Bomberos',                                                                      null),
  ('servicios-publicos',       'j.bautista',  crypt('Direccion#2026',  gen_salt('bf', 10)), 'Jorge Luis Bautista',                 'Responsable de bienes',                                                                 'direccion',  'Dirección de Servicios Públicos y Limpias',                                                                     null),
  ('tecnologias-info',         'a.castillo',  crypt('Direccion#2026',  gen_salt('bf', 10)), 'Andrea Castillo Vega',                'Responsable de bienes',                                                                 'direccion',  'Dirección de Tecnologías de la Información',                                                                    null),
  ('catastro',                 'r.nava',      crypt('Direccion#2026',  gen_salt('bf', 10)), 'Roberto Nava Cruz',                   'Responsable de bienes',                                                                 'direccion',  'Dirección de Catastro',                                                                                         null),
  ('correspondencia',          'g.reyes',     crypt('Direccion#2026',  gen_salt('bf', 10)), 'Gabriela Reyes Molina',               'Responsable de bienes',                                                                 'direccion',  'Unidad Central de Correspondencia',                                                                             null),
  ('gobierno',                 'f.aguilar',   crypt('Direccion#2026',  gen_salt('bf', 10)), 'Fernando Aguilar Ponce',              'Responsable de bienes',                                                                 'direccion',  'Dirección de Gobierno',                                                                                         null),
  ('obras-publicas',           'r.dominguez', crypt('Direccion#2026',  gen_salt('bf', 10)), 'Ricardo Domínguez Silva',             'Responsable de bienes',                                                                 'direccion',  'Dirección de Obras Públicas',                                                                                   null),
  ('servicios-municipales',    'c.herrera',   crypt('Direccion#2026',  gen_salt('bf', 10)), 'Claudia Herrera Luna',                'Responsable de bienes',                                                                 'direccion',  'Dirección de Servicios Municipales',                                                                            null),
  ('logistica-eventos',        's.mendoza',   crypt('Direccion#2026',  gen_salt('bf', 10)), 'Sofía Mendoza Ríos',                  'Responsable de bienes',                                                                 'direccion',  'Dirección de Logística y Eventos',                                                                              null),
  ('comunicacion-social',      'd.cortes',    crypt('Direccion#2026',  gen_salt('bf', 10)), 'Daniel Cortés Salinas',               'Responsable de bienes',                                                                 'direccion',  'Dirección de Comunicación Social y Marketing Digital',                                                          null)
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

-- ============================================================
-- Row Level Security
-- El service-role key omite RLS por completo (acceso de servidor).
-- Habilitar RLS sin políticas bloquea el acceso directo con la
-- anon key, eliminando ese vector de ataque.
-- ============================================================

alter table users      enable row level security;
alter table categories enable row level security;
alter table products   enable row level security;
alter table movements  enable row level security;
