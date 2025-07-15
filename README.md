# Discord Self MCP

Un servidor MCP (Model Context Protocol) que permite a las IAs acceder a Discord usando selfbot para leer mensajes de canales.

## Instalación y Uso

### Opción 1: Uso directo con npx (sin instalación)

No necesitas instalar nada. Simplemente configura tu cliente MCP con:

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "discord-self-mcp"],
      "env": {
        "DISCORD_TOKEN": "tu_token_de_discord_aqui"
      }
    }
  }
}
```

### Opción 2: Instalación global

```bash
npm install -g discord-self-mcp
```

Y luego configura tu cliente MCP:

```json
{
  "mcpServers": {
    "discord": {
      "command": "discord-self-mcp",
      "env": {
        "DISCORD_TOKEN": "tu_token_de_discord_aqui"
      }
    }
  }
}
```

### Opción 3: Desarrollo local

```bash
# Clonar el repositorio
git clone [url-del-repo]
cd discord-self-mcp

# Instalar dependencias
npm install

# Compilar
npm run build

# Configurar en tu cliente MCP con la ruta local
```

## Configuración del Token de Discord

El token de Discord se pasa como variable de entorno desde tu cliente MCP. **NO** uses archivos .env locales.

Para obtener tu token de Discord:
1. Abre Discord en el navegador
2. Presiona F12 para abrir las herramientas de desarrollo
3. Ve a la pestaña "Network"
4. Busca cualquier petición a la API de Discord
5. En los headers, busca "Authorization"

## Herramientas disponibles

### `read_channel`
Lee mensajes de un canal específico.

**Parámetros:**
- `channelId` (string, requerido): ID del canal de Discord
- `limit` (number, opcional): Número de mensajes a obtener (máximo 100, por defecto 50)

### `list_channels`
Lista todos los canales de texto accesibles.

**Parámetros:**
- `guildId` (string, opcional): Filtrar canales por ID del servidor

### `list_guilds`
Lista todos los servidores donde está el usuario.

### `get_user_info`
Obtiene información sobre el usuario conectado.

## Ejemplo de uso en Claude

Una vez configurado, puedes usar comandos como:

```
- "Lista mis servidores de Discord"
- "Lee los últimos 20 mensajes del canal [ID]"
- "Muestra todos los canales del servidor [ID]"
```

## Advertencia

Este proyecto usa selfbot, lo cual va contra los términos de servicio de Discord. Úsalo bajo tu propio riesgo y solo para propósitos educativos o personales.