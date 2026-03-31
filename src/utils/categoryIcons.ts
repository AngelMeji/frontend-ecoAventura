
/**
 * Retorna el SVG del icono correspondiente a una categoría dada su slug.
 * Si no encuentra la categoría, retorna un icono por defecto.
 */
export const getCategoryIcon = (rawSlug: string): string => {
    const slug = rawSlug.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, '-');

    const icons: Record<string, string> = {
        'avistamiento-de-aves': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 18h16M5.8 9.6c.9-1.2 2.5-1.6 3.9-1.1 1.3.5 2.3 1.6 2.7 2.9l.4 1.3-1.4.3c-.8.2-1.6-.2-1.9-1-.3-.8-.1-1.6.5-2.2l-1.3-1c-.5.4-.8 1-.9 1.6-.1.6.1 1.2.5 1.6l1.5 1.5c1.1 1.1 2.6 1.7 4.1 1.7 1.5 0 3-.6 4.1-1.7l1-1M6.5 9.5c.3-.3.7-.4 1.1-.4.4 0 .7.1 1 .4l2.5 2.5" /></svg>',
        'senderismo': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>', // Icono genérico de senderismo/montaña
        'paisaje-cultural-cafetero': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>',
        'termales': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 14a6 6 0 0012 0M6 14v2m12-2v2M12 3v5m4-5v5m-8-5v5M4 14.8C2.8 16 2.8 18 4 19.2s3.2 1.2 4.4 0c1.2-1.2 1.2-3.2 0-4.4M15.6 14.8c-1.2 1.2-1.2 3.2 0 4.4s3.2 1.2 4.4 0c1.2-1.2 1.2-3.2 0-4.4" /></svg>',
        'nevados': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 19.4L14 4l-4.5 9.9M7 19.4L3 14 12 4M21 19.4H3M12 4l2.5 5.5-5 5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4l3 7h-6l3-7z" /></svg>',
        'cascadas': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 3c0 4-2 6-4 9v6M13 3c0 4-2 6-4 9v6M9 3c0 4-2 6-4 9v6M3 21c2 0 3-1 6-1s4 1 6 1 4-1 6-1" /></svg>',
        'glamping': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 21H4L12 3l8 18zM12 7v14M9 21l3-5 3 5" /></svg>',
        'parques-tematicos': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>',
        'rios-y-lagos': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6c2.5-2 5.5-2 8 0s5.5 2 8 0 M3 12c2.5-2 5.5-2 8 0s5.5 2 8 0 M3 18c2.5-2 5.5-2 8 0s5.5 2 8 0" /></svg>',
        'miradores': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>',
        'turismo-rural': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
        'aventura': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.83 9.17l-5.66 5.66-2.5-2.5 5.66-5.66 2.5 2.5z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2v2m0 16v2m10-10h-2M4 12H2" /></svg>'
    };

    return icons[slug] || '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
};
