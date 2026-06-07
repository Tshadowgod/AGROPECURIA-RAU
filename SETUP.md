# RAU Bolivia — Guía de Configuración

## 1. Configurar Base de Datos Neon

1. Ir a [neon.tech](https://neon.tech) y crear una cuenta gratuita
2. Crear un nuevo proyecto llamado `rau-platform`
3. Copiar la **Connection String** (pooled) y la **Direct URL**

## 2. Variables de Entorno

Editar el archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/rau_platform?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/rau_platform?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-seguro-aqui"
```

> Para generar NEXTAUTH_SECRET: ejecuta `openssl rand -base64 32`

## 3. Inicializar Base de Datos

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Generar cliente Prisma
npm run db:generate

# Crear tablas en Neon
npm run db:push

# Cargar datos de ejemplo
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

## 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 5. Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@raubolivia.bo | admin2024 |
| Contador | contador@raubolivia.bo | contador2024 |
| Propietario | propietario@raubolivia.bo | propietario2024 |

## 6. Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard:
# DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
```

## Estructura del Proyecto

```
rau-platform/
├── app/
│   ├── (auth)/          # Login y Registro
│   ├── (dashboard)/
│   │   ├── owner/       # Panel Propietario
│   │   ├── accountant/  # Panel Contador
│   │   └── admin/       # Panel Administrador
│   └── api/             # API Routes
├── components/
│   ├── ui/              # Componentes base
│   └── layout/          # Sidebar y Layout
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client
│   └── rau-calculator.ts # Lógica de cálculo RAU
├── prisma/
│   ├── schema.prisma    # Esquema de BD
│   └── seed.ts          # Datos iniciales
└── proxy.ts             # Middleware de rutas
```
