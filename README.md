# localChat

App de Android de chat **ligera y completamente local**, hecha con **React Native (Expo)**. La interfaz se define con
**dos colores complementarios**: tus mensajes van a la derecha con el color de la app y los del otro a la izquierda
con su complementario.

> Estado: de momento es solo la interfaz. No hay conexión entre móviles: los dos lados se escriben en el mismo móvil
> (botón de la izquierda del campo de texto o tocando la barra de arriba).

**Chat**
- Burbujas a dos colores; el texto se pone negro o blanco según el color para que siempre se lea.
- Tocar la barra de arriba (o el botón de la izquierda del campo de texto) cambia quién escribe; la barra y el botón
  de enviar toman el color de ese lado.
- La barra de escribir crece con el texto (hasta cinco líneas). En el navegador, Enter envía y Mayús + Enter salta de línea.
- Los chats se guardan en el móvil.

**Configuración** (icono de engranaje)
- **Nuevo chat** y, al lado, el botón del **historial**: los chats agrupados por el día en que se crearon.
- Color de la app: azul, rojo, verde o morado (el del otro lado es su complementario, calculado solo).
- Fondo: claro, sepia, oscuro o AMOLED.
- Botón para restablecer los colores por defecto.
- **Actualizaciones**: busca la última release en [GitHub](https://github.com/Kriih/localChat/releases) y, si es más nueva, descarga el APK y abre el instalador de Android (los chats y ajustes se conservan).

## Estructura

```
mobile/                             App (React Native + Expo)
├── src/app/                        Pantallas (Expo Router)
│   ├── _layout.js                  Pila de navegación, ajustes y chats compartidos
│   ├── index.js                    Chat
│   ├── settings.js                 Configuración
│   └── history.js                  Historial de chats por días
├── chats/                          Chats guardados (useChats.js) y dónde se guardan (chatStore*.js)
├── settings/                       Ajustes: colores (theme.js, colors.js), estado compartido (useSettings.js) y dónde se guardan
├── components/                     Piezas de la interfaz (botones, secciones, chats, avisos, actualizaciones)
├── updates/                        Buscar e instalar actualizaciones desde las releases de GitHub
├── scripts/make-icons.py           Genera los iconos de assets/ (python3 scripts/make-icons.py)
├── app.json                        Configuración de la app (nombre, versión, paquete, permisos, repositorio de GitHub)
└── android/                        Proyecto Android generado con prebuild (no editar a mano)
```

Los iconos de `assets/` son todavía los de la app de la que viene (un documento); se cambian en `scripts/make-icons.py`.

## Preparación (una sola vez)

### 1. Node.js 20+

Comprueba si lo tienes con `node -v`. Si dice `command not found`, instálalo con [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24
```

### 2. Dependencias de la app

```bash
cd mobile
npm install        # repítelo cuando cambie package.json
```

### 3. Solo para el APK: Java y SDK de Android

- **JDK 17** y **Android SDK**, instalados en `~/Android` (`~/Android/jdk-17` y `~/Android/sdk`).
- **Swap** (recomendado si tienes poca RAM): sin swap, la compilación puede agotar la memoria y congelar el PC.

  ```bash
  sudo fallocate -l 8G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

  Comprueba con `free -h` que en la línea `Swap` aparece `8,0Gi`.

> **VS Code instalado como Flatpak:** su terminal integrada es un entorno aislado, con su propio Node.
> Un Node instalado o visto desde ahí no sirve en una terminal normal, y al revés: usa siempre una terminal normal del sistema.

## Detalles

### Versión web

- Los ajustes se guardan en el navegador (localStorage): borrar los datos del sitio los devuelve a los valores por defecto.
- Los cambios en el código JavaScript se recargan solos.
- En el navegador, "Actualizaciones" abre la página de la release en vez de instalar el APK.

### El APK, paso a paso

1. **Variables de entorno.** Cada terminal nueva necesita `JAVA_HOME`, `ANDROID_HOME` y el `PATH`; sin ellas, `gradlew` falla con `JAVA_HOME is not set`. Para no repetirlas, añádelas al final de `~/.bashrc`.
2. **`npx expo prebuild -p android --clean`** crea la carpeta `android/` a partir de `app.json` y de los módulos instalados.
   Es seguro borrarla y regenerarla: la configuración propia vive en `app.json`.
   Repítelo cuando cambies `app.json`, los iconos de `assets/` o instales una librería con código nativo: `./gradlew` solo compila lo que ya hay en `android/`.
   Si avisa de cambios de git sin confirmar, puedes continuar; para que no pregunte: `EXPO_NO_GIT_STATUS=1 npx expo prebuild -p android --clean`.
3. **`./gradlew assembleRelease`** compila. La primera vez tarda bastante porque descarga dependencias; las siguientes, mucho menos.
   Con poca RAM, usa estas opciones:

   | Opción | Qué hace |
   |---|---|
   | `-PreactNativeArchitectures=arm64-v8a` | Compila solo para móviles (`arm64-v8a`), no para emuladores (`x86_64`): la mitad del trabajo en C++ y un APK más pequeño. El APK no sirve en un emulador. |
   | `--max-workers=2` | Como máximo 2 tareas a la vez (por defecto, una por núcleo). |
   | `--no-parallel` | Compila los módulos de uno en uno. |

   Tarda más, pero no satura la memoria. En el móvil la app funciona igual con o sin ellas.
4. **El APK** queda en `mobile/android/app/build/outputs/apk/release/app-release.apk`.
   Está firmado con la clave de depuración: sirve para instalarlo en tus dispositivos, no para subirlo a Google Play.
5. **Instalarlo:** copia el archivo al móvil y ábrelo (Android pedirá permitir "orígenes desconocidos"), o por USB con la **depuración USB** activada (Ajustes → Opciones de desarrollador) y `adb install -r`.
   Instalar encima de una versión anterior conserva los ajustes.
   Si Android se niega por un conflicto de firma, desinstala la app antigua; eso **borra los ajustes**.

### Desarrollo con recarga en caliente en el móvil

Con el móvil conectado por USB (o un emulador abierto) y las variables de entorno cargadas:

```bash
cd mobile
npx expo run:android
```

Instala una versión de desarrollo y arranca Metro: los cambios en el código JavaScript se ven al instante.
Los cambios en `app.json` o en dependencias nativas necesitan volver a ejecutar ese comando.

### Comprobaciones antes de compilar

```bash
cd mobile
npx expo lint        # estilo y errores comunes
npx tsc --noEmit     # tipos
npx expo-doctor      # dependencias y configuración de Expo
```

## Problemas frecuentes

| Error | Solución |
|---|---|
| `JAVA_HOME is not set` | Carga las variables de entorno en esa misma terminal (ver "Crear el APK" abajo). |
| `SDK location not found` | Falta `ANDROID_HOME`: carga las variables de entorno. |
| El PC se congela al compilar | Falta memoria: compila con `-PreactNativeArchitectures=arm64-v8a --max-workers=2 --no-parallel` y añade swap. Si se congela, espera un par de minutos o pulsa `Ctrl+Alt+F3`, entra con tu usuario y ejecuta `pkill -f gradle`. |
| Falta un permiso o un módulo en el APK | Vuelve a ejecutar `npx expo prebuild -p android --clean` y compila de nuevo. |
| El puerto 8081 está ocupado | Quedó un servidor en segundo plano: `pkill -f "expo start"`. |

---

## Instrucciones rápidas

Antes de la primera vez, haz la [Preparación](#preparación-una-sola-vez).

### Levantar la app en el navegador (http://localhost:8081)

```bash
cd mobile
npx expo start --web
```

Abre **http://localhost:8081** en el navegador. Para pararlo, `Ctrl+C` en su terminal.

### Crear el APK

```bash
export JAVA_HOME=$HOME/Android/jdk-17
export ANDROID_HOME=$HOME/Android/sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH

cd mobile
npm install
npx expo prebuild -p android --clean     # solo si cambiaste app.json, iconos o librerías nativas

cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=2 --no-parallel
```

El APK queda en `mobile/android/app/build/outputs/apk/release/app-release.apk`.
Para instalarlo en el móvil conectado por USB:

```bash
adb install -r mobile/android/app/build/outputs/apk/release/app-release.apk
```

### Publicar una actualización

La app busca actualizaciones en las releases del repositorio de `app.json` → `extra.githubRepo` (Configuración → Actualizaciones):
compara la etiqueta de la última release con su versión y, si es más nueva, descarga el primer `.apk` adjunto.

1. En `mobile/app.json`, sube `version` (p. ej. `0.1.0` → `0.2.0`) y `android.versionCode` (un número entero, siempre mayor que el anterior).
2. Crea el APK como arriba, con `npx expo prebuild -p android --clean` (la versión se lee de `app.json`).
3. Sube los cambios a GitHub.
4. En GitHub → **Releases → Draft a new release**: etiqueta `v` + la versión (p. ej. `v0.2.0`), escribe las novedades y adjunta el APK.

Las actualizaciones solo se instalan encima si el APK está firmado con la misma clave que el instalado (la de depuración de este proyecto).
