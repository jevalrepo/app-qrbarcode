import { Language } from './i18n';

export interface PrivacySection {
  title: string;
  body: string;
}

export interface PrivacyPolicy {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
  contact: string;
}

const APP_NAME = 'ScanCodi - QR Scanner';
const COMPANY_NAME = 'VLTECH';
const CONTACT_EMAIL = 'contacto@vltech.mx';
const LAST_UPDATED = '24 de abril de 2026';
const LAST_UPDATED_EN = 'April 24, 2026';

const es: PrivacyPolicy = {
  title: 'Política de Privacidad',
  lastUpdated: `Última actualización: ${LAST_UPDATED}`,
  intro: `${APP_NAME} ("nosotros", "nuestro" o "la app") respeta tu privacidad. Esta Política de Privacidad explica qué información puede procesarse cuando utilizas nuestra aplicación móvil, cómo se utiliza, con quién puede compartirse y qué opciones tienes respecto a esos datos. Esta política está diseñada para reflejar el funcionamiento real de la app y los requisitos habituales para su publicación en Google Play.`,
  sections: [
    {
      title: '1. Alcance de esta política',
      body: `Esta política aplica al uso de ${APP_NAME} en dispositivos Android y a las funciones incluidas dentro de la aplicación, como escaneo de códigos QR y de barras, generación de códigos, guardado local de historial, exportación de imágenes, guardado de contactos desde vCard, anuncios en la versión gratuita y compras dentro de la app para desbloquear funciones premium.`,
    },
    {
      title: '2. Información que procesamos',
      body: `Dependiendo de cómo utilices la app, podemos procesar las siguientes categorías de información:\n\n• Contenido de códigos escaneados: texto, URLs, correos electrónicos, teléfonos, redes Wi-Fi, vCards y otros datos contenidos en códigos QR o de barras.\n• Contenido de códigos generados: información que introduces para crear códigos dentro de la app.\n• Historial local y favoritos: la app puede guardar localmente en tu dispositivo un historial de escaneos, un historial de códigos generados y elementos marcados como favoritos.\n• Configuración de la app: idioma, apariencia, color de acento, opciones de vibración u otras preferencias disponibles.\n• Datos técnicos limitados procesados por terceros: algunos proveedores externos, como Google AdMob, RevenueCat y la tienda de aplicaciones o pasarela de pagos correspondiente, pueden procesar identificadores del dispositivo, información del sistema, datos de compra o interacción técnica necesarios para anuncios, validación de compras y funcionamiento del servicio.\n\nImportante: ${APP_NAME} no crea cuentas de usuario ni requiere registro dentro de la app para su funcionamiento principal.`,
    },
    {
      title: '3. Cómo obtenemos la información',
      body: `La información se obtiene de las siguientes formas:\n\n• Directamente de ti, cuando escaneas un código, generas un QR, eliges una imagen desde tu galería, guardas un contacto, compartes contenido o realizas una compra dentro de la app.\n• Automáticamente en tu dispositivo, cuando la app guarda historial, preferencias o estados internos necesarios para su funcionamiento.\n• A través de proveedores externos, cuando se muestran anuncios, se validan compras o se procesa información técnica requerida para esos servicios.`,
    },
    {
      title: '4. Cómo usamos la información',
      body: `Usamos la información únicamente para los fines necesarios para operar la app, por ejemplo:\n\n• Escanear y mostrar el contenido de códigos QR y de barras.\n• Generar códigos QR a partir de la información que introduces.\n• Guardar historial local, favoritos y preferencias dentro del dispositivo.\n• Permitirte abrir enlaces, compartir resultados, copiar contenido o guardar imágenes generadas.\n• Guardar contactos cuando escaneas una vCard y tú eliges agregarlos.\n• Mostrar anuncios en la versión gratuita.\n• Procesar, validar o restaurar compras para habilitar funciones premium.\n• Detectar fallos, prevenir abuso técnico y mantener la seguridad y estabilidad de la app.`,
    },
    {
      title: '5. Permisos del dispositivo',
      body: `La app puede solicitar permisos del dispositivo solo cuando son necesarios para una función específica:\n\n• Cámara: para escanear códigos en tiempo real.\n• Fotos o archivos multimedia: para seleccionar imágenes desde la galería y escanear códigos guardados, o para guardar imágenes generadas en el dispositivo.\n• Contactos: únicamente cuando eliges guardar un contacto a partir de una vCard escaneada.\n• Internet: para cargar anuncios, validar compras, abrir enlaces y permitir funciones relacionadas con servicios externos.\n\nNo utilizamos estos permisos para recopilar información no relacionada con la funcionalidad principal de la app.`,
    },
    {
      title: '6. Almacenamiento local en tu dispositivo',
      body: `Gran parte del funcionamiento de ${APP_NAME} ocurre de forma local en tu dispositivo. El historial de escaneos, el historial de códigos generados, los favoritos y la configuración de la app pueden almacenarse localmente para mejorar tu experiencia.\n\nEn la versión actual de la app, este historial se conserva localmente en un número limitado de entradas por categoría. Si eliminas elementos desde la app o desinstalas la aplicación, esa información local puede dejar de estar disponible.\n\nSalvo cuando intervienen servicios de terceros descritos en esta política, no sincronizamos ese historial a servidores propios de ${APP_NAME}.`,
    },
    {
      title: '7. Contenido procesado en imágenes y cámara',
      body: `Cuando utilizas la cámara o seleccionas una imagen de la galería para escanear un código, el contenido visual se procesa para detectar y leer el código correspondiente.\n\nNo usamos tus imágenes para crear perfiles publicitarios propios, no las vendemos y no las almacenamos en nuestros servidores como parte del funcionamiento principal de la app. Si decides guardar una imagen generada o compartirla, esa acción se realizará bajo tu control y podrá involucrar aplicaciones o servicios de terceros que tú elijas utilizar.`,
    },
    {
      title: '8. Compartir información con terceros',
      body: `Podemos compartir o permitir el procesamiento de información con terceros únicamente en los siguientes casos:\n\n• Google AdMob, para mostrar anuncios y, según corresponda, medir rendimiento o personalizar publicidad conforme a las opciones del usuario y la política de Google.\n• RevenueCat, para gestionar, validar y restaurar compras dentro de la app y confirmar acceso a funciones premium. Puedes consultar su política de privacidad en: https://www.revenuecat.com/privacy\n• Proveedores de pago y la tienda de aplicaciones correspondiente, para procesar transacciones y cumplir obligaciones legales o fiscales relacionadas con compras digitales.\n• Aplicaciones o servicios que tú elijas usar al compartir contenido, abrir enlaces, enviar correos, hacer llamadas, abrir mapas o exportar información desde la app.\n• Autoridades o terceros cuando sea necesario para cumplir la ley, hacer valer derechos, prevenir fraude o responder a requerimientos legales válidos.`,
    },
    {
      title: '9. Publicidad',
      body: `La versión gratuita de ${APP_NAME} puede mostrar anuncios proporcionados por Google AdMob. Google y sus socios pueden procesar ciertos identificadores, información del dispositivo, datos de interacción y otra información técnica para mostrar, limitar, medir o personalizar anuncios, de acuerdo con sus propias políticas y con la configuración disponible en tu dispositivo.\n\nPuedes consultar más información en la Política de Privacidad de Google: https://policies.google.com/privacy\n\nSi adquierés la versión premium o una compra que elimine anuncios, dejaremos de mostrar anuncios en la experiencia correspondiente, aunque ciertas operaciones técnicas relacionadas con compras o validación de acceso todavía pueden requerir comunicación con servicios de terceros.`,
    },
    {
      title: '10. Compras dentro de la app',
      body: `Si realizas una compra dentro de la app, la transacción es procesada por la tienda de aplicaciones correspondiente y por los proveedores tecnológicos necesarios para validar tu compra. ${APP_NAME} no almacena directamente la información completa de tu tarjeta bancaria.\n\nPodemos recibir o procesar identificadores de compra, estado de la transacción, tipo de producto adquirido, estado del acceso premium y datos técnicos mínimos necesarios para verificar tu compra, restaurarla o atender incidencias relacionadas con funciones premium.\n\nPuedes consultar más información sobre RevenueCat en: https://www.revenuecat.com/privacy`,
    },
    {
      title: '11. Retención de datos',
      body: `Conservamos la información durante el tiempo necesario para cumplir los fines descritos en esta política.\n\n• La información almacenada localmente permanece en tu dispositivo hasta que la elimines, borres el historial, cambies ciertos datos o desinstales la app.\n• Los terceros que procesan datos, como proveedores de anuncios o compras, pueden conservar información según sus propias políticas, obligaciones legales y periodos de retención.\n\nTe recomendamos revisar también las políticas de privacidad de esos terceros para conocer sus tiempos de conservación.`,
    },
    {
      title: '12. Seguridad',
      body: `Adoptamos medidas razonables para reducir riesgos de acceso no autorizado, uso indebido o divulgación no deseada de la información procesada por la app. Sin embargo, ningún método de almacenamiento o transmisión electrónica es completamente infalible, por lo que no podemos garantizar seguridad absoluta.\n\nTambién eres responsable de proteger el acceso físico y lógico a tu dispositivo, especialmente si eliges guardar historial, imágenes o contactos desde la app.`,
    },
    {
      title: '13. Tus opciones y controles',
      body: `Según la función utilizada y la configuración de tu dispositivo, puedes:\n\n• Negar o revocar permisos como cámara, fotos o contactos desde Android.\n• Eliminar historial, favoritos o contenido almacenado localmente desde la app o desinstalándola.\n• Decidir si deseas compartir contenido con aplicaciones de terceros.\n• Gestionar preferencias publicitarias y algunos identificadores desde tu cuenta de Google o configuración de Android, cuando sea aplicable.\n• Restaurar o gestionar compras premium conforme a las opciones disponibles en la app y en la tienda de aplicaciones.`,
    },
    {
      title: '14. Privacidad de menores',
      body: `La app no está dirigida de manera intencional a menores de 13 años ni está diseñada para recopilar deliberadamente información personal de menores. Si consideras que un menor ha proporcionado información personal a través de la app, contáctanos para revisar el caso y tomar medidas razonables cuando corresponda.`,
    },
    {
      title: '15. Transferencias internacionales',
      body: `Algunos proveedores externos utilizados por la app pueden procesar información en servidores ubicados fuera de tu país de residencia. Cuando esto ocurra, dicho tratamiento se regirá por las políticas y salvaguardas aplicables de esos proveedores.`,
    },
    {
      title: '16. Cambios a esta política',
      body: `Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en la app, en nuestros procesos, en requisitos legales o en las políticas de las plataformas donde se distribuya. Publicaremos la versión actualizada con su fecha de última actualización dentro de la app o en el canal correspondiente.`,
    },
    {
      title: '17. Contacto',
      body: `Si tienes preguntas, solicitudes o comentarios sobre esta Política de Privacidad o sobre el tratamiento de datos en ${APP_NAME}, puedes escribirnos a:\n\n${CONTACT_EMAIL}`,
    },
  ],
  contact: CONTACT_EMAIL,
};

const en: PrivacyPolicy = {
  title: 'Privacy Policy',
  lastUpdated: `Last updated: ${LAST_UPDATED_EN}`,
  intro: `${APP_NAME} ("we", "our", or "the app") respects your privacy. This Privacy Policy explains what information may be processed when you use our mobile application, how it is used, with whom it may be shared, and what choices you have regarding that information. This policy is intended to reflect the actual operation of the app and common requirements for publication on Google Play.`,
  sections: [
    {
      title: '1. Scope of This Policy',
      body: `This policy applies to the use of ${APP_NAME} on Android devices and to the features included in the application, such as QR and barcode scanning, code generation, local history storage, image export, saving contacts from vCards, advertising in the free version, and in-app purchases used to unlock premium functionality.`,
    },
    {
      title: '2. Information We Process',
      body: `Depending on how you use the app, we may process the following categories of information:\n\n• Scanned code content: text, URLs, email addresses, phone numbers, Wi-Fi data, vCards, and other data contained in QR codes or barcodes.\n• Generated code content: information you enter to create codes within the app.\n• Local history and favorites: the app may store scan history, generated-code history, and favorited items locally on your device.\n• App settings: language, appearance, accent color, vibration preferences, and other available settings.\n• Limited technical data processed by third parties: some external providers, such as Google AdMob, RevenueCat, and the relevant app store or payment processor, may process device identifiers, system information, purchase data, or technical interaction data required for advertising, purchase validation, and service operation.\n\nImportant: ${APP_NAME} does not create user accounts and does not require in-app registration for its core functionality.`,
    },
    {
      title: '3. How Information Is Obtained',
      body: `Information is obtained in the following ways:\n\n• Directly from you, when you scan a code, generate a QR code, choose an image from your gallery, save a contact, share content, or make an in-app purchase.\n• Automatically on your device, when the app stores history, preferences, or internal state needed for functionality.\n• Through third-party providers, when ads are displayed, purchases are validated, or technical information is processed for those services.`,
    },
    {
      title: '4. How We Use Information',
      body: `We use information only for purposes necessary to operate the app, including:\n\n• Scanning and displaying QR code and barcode content.\n• Generating QR codes from the information you provide.\n• Saving local history, favorites, and app preferences on the device.\n• Allowing you to open links, share results, copy content, or save generated images.\n• Saving contacts when you scan a vCard and choose to add it.\n• Displaying ads in the free version.\n• Processing, validating, or restoring purchases to enable premium functionality.\n• Detecting malfunctions, preventing technical abuse, and maintaining app security and stability.`,
    },
    {
      title: '5. Device Permissions',
      body: `The app may request device permissions only when they are necessary for a specific feature:\n\n• Camera: to scan codes in real time.\n• Photos or media files: to select images from your gallery and scan stored codes, or to save generated images to your device.\n• Contacts: only when you choose to save a contact from a scanned vCard.\n• Internet: to load ads, validate purchases, open links, and support features connected to external services.\n\nWe do not use these permissions to collect information unrelated to the app's core functionality.`,
    },
    {
      title: '6. Local Storage on Your Device',
      body: `A large part of ${APP_NAME}'s functionality takes place locally on your device. Scan history, generated-code history, favorites, and app settings may be stored locally to improve your experience.\n\nIn the current version of the app, this history is stored locally in a limited number of entries per category. If you remove items from the app or uninstall it, that local information may no longer be available.\n\nExcept where third-party services described in this policy are involved, we do not sync that history to ${APP_NAME}'s own servers.`,
    },
    {
      title: '7. Content Processed Through Camera and Images',
      body: `When you use the camera or choose an image from the gallery to scan a code, the visual content is processed to detect and read the corresponding code.\n\nWe do not use your images to create our own advertising profiles, we do not sell them, and we do not store them on our servers as part of the app's core functionality. If you choose to save or share a generated image, that action occurs under your control and may involve third-party apps or services that you choose to use.`,
    },
    {
      title: '8. Sharing Information with Third Parties',
      body: `We may share information or allow it to be processed by third parties only in the following situations:\n\n• Google AdMob, to display ads and, where applicable, measure performance or personalize advertising according to user choices and Google's policies.\n• RevenueCat, to manage, validate, and restore in-app purchases and confirm access to premium features. You can review its Privacy Policy at: https://www.revenuecat.com/privacy\n• Payment providers and the relevant app store, to process transactions and comply with legal or tax obligations related to digital purchases.\n• Apps or services that you choose to use when sharing content, opening links, sending emails, making calls, opening maps, or exporting information from the app.\n• Authorities or third parties when necessary to comply with the law, enforce rights, prevent fraud, or respond to valid legal requests.`,
    },
    {
      title: '9. Advertising',
      body: `The free version of ${APP_NAME} may display ads provided by Google AdMob. Google and its partners may process certain identifiers, device information, interaction data, and other technical information to serve, limit, measure, or personalize advertising, subject to their own policies and to the settings available on your device.\n\nYou can learn more in Google's Privacy Policy: https://policies.google.com/privacy\n\nIf you purchase a premium version or a purchase that removes ads, we will stop showing ads in the applicable experience, although certain technical operations related to purchases or entitlement validation may still require communication with third-party services.`,
    },
    {
      title: '10. In-App Purchases',
      body: `If you make an in-app purchase, the transaction is processed by the relevant app store and by technology providers required to validate your purchase. ${APP_NAME} does not directly store your full payment card information.\n\nWe may receive or process purchase identifiers, transaction status, purchased product type, premium access status, and minimal technical data necessary to verify your purchase, restore it, or support premium-related issues.\n\nYou can find more information about RevenueCat at: https://www.revenuecat.com/privacy`,
    },
    {
      title: '11. Data Retention',
      body: `We keep information for as long as necessary to fulfill the purposes described in this policy.\n\n• Information stored locally remains on your device until you remove it, clear history, change certain data, or uninstall the app.\n• Third parties processing data, such as advertising or purchase providers, may retain information in accordance with their own policies, legal obligations, and retention periods.\n\nWe encourage you to review those third-party privacy policies for more detail about their retention practices.`,
    },
    {
      title: '12. Security',
      body: `We take reasonable steps to reduce the risk of unauthorized access, misuse, or unwanted disclosure of information processed by the app. However, no method of electronic storage or transmission is completely secure, so we cannot guarantee absolute security.\n\nYou are also responsible for protecting physical and logical access to your device, especially if you choose to save history, images, or contacts from the app.`,
    },
    {
      title: '13. Your Choices and Controls',
      body: `Depending on the feature used and your device settings, you may:\n\n• Deny or revoke permissions such as camera, photos, or contacts through Android settings.\n• Delete history, favorites, or locally stored content from within the app or by uninstalling it.\n• Decide whether to share content with third-party applications.\n• Manage advertising preferences and certain identifiers through your Google account or Android settings, where available.\n• Restore or manage premium purchases using the options available in the app and in the app store.`,
    },
    {
      title: "14. Children's Privacy",
      body: `The app is not intentionally directed to children under 13 and is not designed to knowingly collect personal information from children. If you believe that a child has provided personal information through the app, please contact us so we can review the matter and take reasonable action where appropriate.`,
    },
    {
      title: '15. International Transfers',
      body: `Some third-party providers used by the app may process information on servers located outside your country of residence. When this happens, such processing is governed by the applicable policies and safeguards of those providers.`,
    },
    {
      title: '16. Changes to This Policy',
      body: `We may update this Privacy Policy from time to time to reflect changes in the app, our processes, legal requirements, or the policies of the platforms where the app is distributed. We will publish the updated version together with its effective date within the app or through the appropriate channel.`,
    },
    {
      title: '17. Contact',
      body: `If you have questions, requests, or comments about this Privacy Policy or the processing of data in ${APP_NAME}, you can contact us at:\n\n${CONTACT_EMAIL}`,
    },
  ],
  contact: CONTACT_EMAIL,
};

export const privacyContent: Record<Language, PrivacyPolicy> = { es, en };
