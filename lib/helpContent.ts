import { Language } from './i18n';

export interface HelpSection {
  id: string;
  icon: string;
  color: string;
  title: string;
  items: string[];
}

const es: HelpSection[] = [
  {
    id: 'scanner',
    icon: 'scan-outline',
    color: '#00C896',
    title: 'Escáner',
    items: [
      'Apunta la cámara a cualquier QR o código de barras para escanearlo al instante.',
      'Formatos soportados: QR, EAN-13, EAN-8, UPC-A, UPC-E, Code128, Code39, PDF417, Aztec, DataMatrix, ITF-14.',
      'Toca el ícono de rayo ⚡ para activar o desactivar la linterna.',
      'Pellizca la pantalla con dos dedos para hacer zoom (hasta 4.6×).',
      'Toca el ícono de galería 🖼️ en la parte inferior para intentar escanear desde una imagen de tu galería.',
      'Al detectar un código, la app vibra (si tienes activado el háptico) y te lleva al resultado automáticamente.',
    ],
  },
  {
    id: 'result',
    icon: 'checkmark-circle-outline',
    color: '#639922',
    title: 'Resultado',
    items: [
      'La app detecta automáticamente el tipo de contenido: URL, Email, Teléfono, WiFi, Contacto, Ubicación, SMS, Producto o Texto.',
      'El botón principal ejecuta la acción inteligente según el tipo detectado:',
      '→ URL: abre el enlace en el navegador.',
      '→ Email: abre tu app de correo con la dirección lista.',
      '→ Teléfono: inicia una llamada.',
      '→ WiFi: muestra el nombre de la red y su contraseña.',
      '→ Contacto (vCard): guarda la persona en tu agenda.',
      '→ Ubicación: abre la dirección en mapas.',
      '→ SMS: abre el compositor de mensajes.',
      '→ Producto: busca el código en Google.',
      'Toca "Copiar texto" para guardar el contenido en el portapapeles.',
      'Toca "Compartir" para enviar el contenido por WhatsApp, correo, notas u otras apps.',
      'Toca "Escanear otro" para volver al escáner sin cerrar la pantalla.',
      'Si tienes activado "Abrir sitios automáticamente" en Ajustes, las URLs se abren al instante.',
    ],
  },
  {
    id: 'history',
    icon: 'time-outline',
    color: '#378ADD',
    title: 'Historial',
    items: [
      'La app guarda automáticamente los últimos 20 escaneos.',
      'Toca cualquier escaneo para volver a ver su resultado y acciones.',
      'Usa la barra de búsqueda para encontrar un escaneo por su contenido.',
      'Filtra el historial por tipo usando los chips: Todos, Favoritos, URL, WiFi, Producto, etc.',
      'Toca el ícono de estrella ⭐ en un escaneo para marcarlo como favorito.',
      'Los favoritos aparecen resaltados y no se eliminan al borrar el historial.',
      'Toca "Borrar todo" para limpiar el historial. Los favoritos siempre se conservan.',
      'Si hay duplicados, el escaneo más reciente reemplaza al anterior.',
    ],
  },
  {
    id: 'generate',
    icon: 'qr-code-outline',
    color: '#7F77DD',
    title: 'Generar QR',
    items: [
      'Elige el tipo de QR que quieres crear: URL, Texto, WiFi, Email, Teléfono o Contacto.',
      'Rellena los campos requeridos y toca "Generar QR" para ver la vista previa.',
      'Toca "Portapapeles" para generar al instante un QR del texto que tienes copiado.',
      'En la vista previa, mantén presionado el código para copiar la imagen al portapapeles.',
      'Toca "Compartir imagen" para enviarla por WhatsApp, guardarla en fotos, etc.',
      '→ WiFi: genera un QR que al escanearse conecta automáticamente a tu red.',
      '→ Contacto: rellena nombre, teléfono, correo y empresa para crear una vCard. Cualquier teléfono puede escanearlo para guardar el contacto.',
    ],
  },
  {
    id: 'settings',
    icon: 'settings-outline',
    color: '#888780',
    title: 'Ajustes',
    items: [
      'Tema: elige entre Claro, Oscuro o Automático (sigue la configuración de tu sistema).',
      'Idioma: cambia entre Español e English en cualquier momento.',
      'Color de acento: personaliza el color principal de la app con 7 opciones.',
      'Abrir sitios automáticamente: si está activado, las URLs se abren en el navegador al instante al escanearlas.',
      'Vibración al escanear: activa o desactiva el háptico que se siente al detectar un código.',
    ],
  },
  {
    id: 'pro',
    icon: 'star-outline',
    color: '#EF9F27',
    title: 'Versión Pro',
    items: [
      'La versión Pro elimina todos los anuncios de forma permanente.',
      'Es un pago único, sin suscripción ni renovaciones automáticas.',
      'Disponible desde el menú de Ajustes en la parte superior.',
      'Si cambias de dispositivo o reinstalás la app, toca "Restaurar compra" para recuperar el acceso sin pagar de nuevo.',
    ],
  },
];

const en: HelpSection[] = [
  {
    id: 'scanner',
    icon: 'scan-outline',
    color: '#00C896',
    title: 'Scanner',
    items: [
      'Point the camera at any QR code or barcode to scan it instantly.',
      'Supported formats: QR, EAN-13, EAN-8, UPC-A, UPC-E, Code128, Code39, PDF417, Aztec, DataMatrix, ITF-14.',
      'Tap the flash ⚡ icon to toggle the flashlight on or off.',
      'Pinch the screen with two fingers to zoom in (up to 4.6×).',
      'Tap the gallery 🖼️ icon at the bottom to scan a QR code from an image in your gallery.',
      'When a code is detected, the app vibrates (if haptics are enabled) and takes you to the result automatically.',
    ],
  },
  {
    id: 'result',
    icon: 'checkmark-circle-outline',
    color: '#639922',
    title: 'Result',
    items: [
      'The app automatically detects the content type: URL, Email, Phone, WiFi, Contact, Location, SMS, Product, or Text.',
      'The main button runs the smart action based on the detected type:',
      '→ URL: opens the link in the browser.',
      '→ Email: opens your mail app with the address ready.',
      '→ Phone: starts a call.',
      '→ WiFi: shows the network name and password.',
      '→ Contact (vCard): saves the person to your contacts.',
      '→ Location: opens the address in maps.',
      '→ SMS: opens the message composer.',
      '→ Product: searches the barcode on Google.',
      'Tap "Copy text" to save the content to the clipboard.',
      'Tap "Share" to send the content via WhatsApp, email, notes, or other apps.',
      'Tap "Scan another" to return to the scanner without closing the screen.',
      'If "Auto-open websites" is enabled in Settings, URLs open instantly after scanning.',
    ],
  },
  {
    id: 'history',
    icon: 'time-outline',
    color: '#378ADD',
    title: 'History',
    items: [
      'The app automatically saves the last 20 scans.',
      'Tap any scan to view its result and actions again.',
      'Use the search bar to find a scan by its content.',
      'Filter history by type using the chips: All, Favorites, URL, WiFi, Product, etc.',
      'Tap the star ⭐ icon on a scan to mark it as a favorite.',
      'Favorites are highlighted and are never deleted when clearing history.',
      'Tap "Clear all" to delete the history. Favorites are always preserved.',
      'If there are duplicates, the most recent scan replaces the older one.',
    ],
  },
  {
    id: 'generate',
    icon: 'qr-code-outline',
    color: '#7F77DD',
    title: 'Generate QR',
    items: [
      'Choose the type of QR you want to create: URL, Text, WiFi, Email, Phone, or Contact.',
      'Fill in the required fields and tap "Generate QR" to see the preview.',
      'Tap "Clipboard" to instantly generate a QR from the text you have copied.',
      'In the preview, press and hold the code to copy the image to the clipboard.',
      'Tap "Share image" to send it via WhatsApp, save it to photos, etc.',
      '→ WiFi: generates a QR that automatically connects to your network when scanned.',
      '→ Contact: fill in name, phone, email and company to create a vCard. Any phone can scan it to save the contact.',
    ],
  },
  {
    id: 'settings',
    icon: 'settings-outline',
    color: '#888780',
    title: 'Settings',
    items: [
      'Theme: choose between Light, Dark, or Automatic (follows your system setting).',
      'Language: switch between Español and English at any time.',
      'Accent color: customize the app\'s main color with 7 options.',
      'Auto-open websites: when enabled, URLs open in the browser instantly after scanning.',
      'Vibration on scan: toggle the haptic feedback felt when a code is detected.',
    ],
  },
  {
    id: 'pro',
    icon: 'star-outline',
    color: '#EF9F27',
    title: 'Pro Version',
    items: [
      'The Pro version permanently removes all ads.',
      'It\'s a one-time payment — no subscription, no automatic renewals.',
      'Available from the top of the Settings menu.',
      'If you change devices or reinstall the app, tap "Restore purchase" to recover access without paying again.',
    ],
  },
];

export const helpContent: Record<Language, HelpSection[]> = { es, en };
