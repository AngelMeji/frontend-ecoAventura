export const translations = {
    es: {
        header: {
            home: 'Inicio',
            adminPanel: 'Panel Admin',
            partnerPanel: 'Panel Socio',
            myAccount: 'Mi Cuenta',
            logout: 'Cerrar Sesión',
            login: 'Iniciar Sesión',
            register: 'Registrarse',
        },
        accessibility: {
            title: 'Accesibilidad',
            reset: 'Restablecer',
            fontSize: 'Tamaño de Texto',
            invertColors: 'Invertir Colores',
            grayscale: 'Escala de Grises',
            language: 'Idioma',
            options: 'Opciones de accesibilidad'
        },
        home: {
            hero: {
                subtitle: 'Descubre Risaralda',
                title: 'Explora Paraísos',
                highlight: 'Ecoturísticos',
                description: 'Sumérgete en la magia de la biodiversidad. Encuentra los destinos más hermosos y sostenibles para tu próxima aventura en la naturaleza.',
                cta: 'Comenzar Aventura'
            },
            map: {
                title: 'Mapa de Destinos',
                subtitle: 'Ubica tu próxima experiencia',
                legend: 'Leyenda',
                available: 'Destinos disponibles',
                hint: 'Haz clic en los marcadores para ver detalles',
                viewDetails: 'Ver detalles'
            },
            grid: {
                searchResults: 'Resultados de Búsqueda',
                searching: 'Buscando destinos...',
                allDestinations: 'Todos los Destinos',
                found_one: 'destino encontrado',
                found_other: 'destinos encontrados',
                loading: 'Cargando experiencias...',
                noResultsTitle: 'No encontramos destinos',
                noResultsDesc: 'Intenta con otra búsqueda o categoría'
            },
            filterBar: {
                placeholder: 'Buscar destinos...'
            },
            categories: {
                title: 'Explorar por Categorías',
                subtitle: 'Descubre destinos organizados por tipo de experiencia',
                reset: 'Restablecer',
                place_one: 'lugar',
                place_other: 'lugares',
                names: {
                    'avistamiento-de-aves': 'Avistamiento de aves',
                    'senderismo': 'Senderismo',
                    'paisaje-cultural-cafetero': 'Paisaje cultural cafetero',
                    'termales': 'Termales',
                    'nevados-y-montanas': 'Nevados y montañas',
                    'cascadas': 'Cascadas',
                    'glamping': 'Glamping',
                    'parques-tematicos': 'Parques temáticos',
                    'rios-y-lagos': 'Ríos y lagos',
                    'miradores': 'Miradores'
                }
            },
            card: {
                viewDetails: 'Ver Detalles',
                na: 'N/A',
                difficulty: {
                    'facil': 'Fácil',
                    'media': 'Media',
                    'dificil': 'Difícil',
                    'Fácil': 'Fácil',
                    'Media': 'Media',
                    'Difícil': 'Difícil'
                }
            },
            modal: {
                tabs: {
                    info: 'Info',
                    reviews: 'Reseñas'
                },
                actions: {
                    addToFavorites: 'Guardar en favoritos',
                    removeFromFavorites: 'Quitar de favoritos',
                    submitReview: 'Publicar Reseña',
                    submitting: 'Enviando...'
                },
                info: {
                    description: 'Descripción',
                    location: 'Ubicación',
                    coordinates: 'Coordenadas',
                    difficulty_na: 'Dificultad N/A',
                    duration_na: 'Duración N/A',
                    season_na: 'Mejor temporada N/A'
                },
                reviews: {
                    title: 'Escribe una Reseña',
                    ratingLabel: 'Calificación:',
                    placeholder: 'Comparte tu experiencia...',
                    loginToReview: 'Inicia sesión para compartir tu experiencia.',
                    usersReviewsTitle: 'Opiniones de otros viajeros',
                    noReviews: 'Aún no hay reseñas. ¡Sé el primero!',
                    anonymous: 'Anónimo',
                    hiddenComment: 'Este comentario ha sido ocultado por moderación.',
                    reviewsCount: 'reseñas',
                    actions: {
                        edit: 'Editar',
                        delete: 'Eliminar',
                        save: 'Guardar',
                        cancel: 'Cancelar',
                        confirmDeleteTitle: '¿Eliminar reseña?',
                        confirmDeleteMessage: 'Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este comentario?'
                    }
                },
                messages: {
                    selectRating: 'Por favor selecciona una calificación',
                    success: '¡Reseña enviada con éxito!',
                    loginRequired: 'Debes iniciar sesión para guardar favoritos',
                    error: 'Ocurrió un error.'
                }
            },
            profile: {
                title: 'Mi Perfil',
                personalInfo: 'Información Personal',
                security: 'Seguridad',
                profilePhoto: 'Foto de Perfil',
                uploadNewPhoto: 'Subir Nueva Foto',
                fullName: 'Nombre Completo',
                email: 'Correo Electrónico',
                currentPassword: 'Contraseña Actual',
                newPassword: 'Nueva Contraseña',
                confirmPassword: 'Confirmar Contraseña',
                saving: 'Guardando...',
                saveChanges: 'Guardar Cambios',
                updatePassword: 'Actualizar Contraseña',
                messages: {
                    passwordMismatch: 'Las contraseñas no coinciden',
                    profileUpdateSuccess: 'Perfil actualizado con éxito. Redirigiendo...',
                    profileUpdateError: 'No se pudo actualizar el perfil.',
                    passwordUpdateSuccess: 'Cambio de contraseña exitoso. Por favor, ingrese nuevamente para iniciar sesión con sus nuevas credenciales.',
                    passwordUpdateError: 'Error al actualizar contraseña',
                    invalidData: 'Datos inválidos'
                }
            },
            dashboard: {
                welcome: {
                    hello: 'Hola',
                    subtitle: 'Bienvenido a tu panel de control',
                    verifiedPartner: 'Socio Verificado',
                    admin: 'Administrador',
                    explorer: 'Explorador',
                    editProfile: 'Editar Perfil',
                    createPlace: 'Crear Lugar'
                },
                stats: {
                    totalUsers: 'Usuarios Totales',
                    totalPlaces: 'Lugares Publicados',
                    pendingPlaces: 'Pendientes',
                    totalReviews: 'Reseñas Totales',
                    topRated: 'Mejor Valorado',
                    mostPopular: 'Más Popular',
                    topCategory: 'Categoría Top',
                    basedOnReviews: 'Basado en reseñas',
                    mostFavorites: 'Más favoritos',
                    mostPlaces: 'Más lugares',
                    noData: 'No hay datos aún',
                    saved: 'guardados',
                    places: 'lugares',
                    reviews: 'reseñas',
                    myPlaces: 'Mis Publicaciones',
                    approved: 'Aprobados',
                    inReview: 'En Revisión'
                },
                user: {
                    favoritePlaces: 'Lugares Favoritos',
                    writtenReviews: 'Reseñas Escritas',
                    myFavorites: 'Mis Favoritos',
                    noFavoritesYet: 'Aún no has guardado ningún lugar favorito.',
                    exploreMap: 'Explorar Mapa'
                },
                partner: {
                    manageDestinations: 'Gestionar Destinos',
                    manageSubtitle: 'Comparte la belleza natural con el mundo. Crea nuevos destinos ecoturísticos y gestiona los existentes desde aquí.',
                    publishNew: 'Publicar Nuevo Lugar',
                    myPublications: 'Mis Publicaciones'
                },
                tables: {
                    place: 'Lugar',
                    partner: 'Socio',
                    status: 'Estado',
                    actions: 'Acciones',
                    user: 'Usuario',
                    email: 'Email',
                    role: 'Rol',
                    rating: 'Calificación',
                    comment: 'Comentario'
                },
                actions: {
                    approve: 'Aprobar',
                    reject: 'Rechazar',
                    changes: 'Cambios',
                    view: 'Ver',
                    delete: 'Eliminar',
                    edit: 'Editar',
                    create: 'Crear',
                    cancel: 'Cancelar',
                    save: 'Guardar Cambios',
                    hide: 'Ocultar',
                    show: 'Mostrar'
                },
                status: {
                    pending: 'Pendiente',
                    approved: 'Aprobado',
                    rejected: 'Rechazado',
                    needs_fix: 'Requiere Cambios',
                    published: 'Publicado',
                    hidden: 'Oculto',
                    visible: 'Visible'
                },
                messages: {
                    loading: 'Cargando...',
                    approveSuccess: 'Lugar aprobado correctamente',
                    approveError: 'Error aprobando lugar',
                    rejectSuccess: 'Lugar rechazado correctamente',
                    rejectError: 'Error al rechazar el lugar',
                    deleteSuccess: 'Lugar eliminado correctamente',
                    deleteError: 'Error eliminando lugar',
                    statusSuccess: 'Estado actualizado correctamente',
                    statusError: 'Error cambiando el estado',
                    changesSuccess: 'Solicitud de cambios enviada correctamente',
                    changesError: 'Error al enviar la solicitud',
                    allUpToDate: '¡Todo al día! No hay lugares pendientes de revisión.',
                    confirmApprove: '¿Estás seguro de que deseas aprobar este lugar?',
                    confirmReject: '¿Estás seguro de que deseas rechazar este lugar?',
                    confirmDelete: '¿Estás seguro de que deseas eliminar este lugar? Esta acción no se puede deshacer.',
                    confirmChanges: '¿El lugar requiere correcciones por parte del socio?',
                    confirmStatus: '¿Estás seguro de que deseas cambiar el estado a'
                },
                sections: {
                    pendingPlaces: 'Lugares Pendientes de Aprobación',
                    manageAll: 'Administrar Todos los Lugares',
                    userManagement: 'Gestión de Usuarios',
                    reviewModeration: 'Moderación de Reseñas',
                    adminOnly: 'Admin Only'
                },
                adminUsers: {
                    createNew: 'Crear Nuevo Usuario',
                    editUser: 'Editar Usuario',
                    deleteUser: 'Eliminar Usuario',
                    confirmDelete: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
                    form: {
                        name: 'Nombre',
                        email: 'Email',
                        role: 'Rol',
                        password: 'Contraseña',
                        repeatPassword: 'Repetir Contraseña',
                        selectRole: 'Seleccionar Rol'
                    },
                    roles: {
                        admin: 'Administrador',
                        partner: 'Socio',
                        user: 'Usuario'
                    },
                    messages: {
                        created: 'Usuario creado exitosamente',
                        updated: 'Usuario actualizado exitosamente',
                        deleted: 'Usuario eliminado exitosamente',
                        error: 'Error en la operación',
                        passwordsDoNotMatch: 'Las contraseñas no coinciden'
                    }
                },
                adminReviews: {
                    place: 'Lugar',
                    user: 'Usuario',
                    rating: 'Calificación',
                    comment: 'Comentario',
                    status: 'Estado',
                    action: 'Acción',
                    hide: 'Ocultar',
                    show: 'Mostrar',
                    hidden: 'Oculto',
                    visible: 'Visible',
                    confirmHide: '¿Ocultar este comentario?',
                    confirmShow: '¿Mostrar este comentario?',
                    messages: {
                        statusChanged: 'Estado de la reseña actualizado',
                        error: 'Error actualizando estado'
                    }
                }
            },
            footer: {
                rights: 'Todos los derechos reservados.',
                privacy: 'Privacidad',
                cookies: 'Cookies'
            },
            privacy: {
                title: 'Política de Privacidad',
                lastUpdated: 'Última actualización',
                intro: {
                    title: 'Introducción',
                    content: 'En EcoAventura, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información.'
                },
                dataCollection: {
                    title: 'Información que Recopilamos',
                    intro: 'Recopilamos la siguiente información cuando utilizas nuestros servicios:',
                    items: {
                        name: 'Nombre y datos de contacto',
                        email: 'Dirección de correo electrónico',
                        profile: 'Información de perfil y preferencias',
                        reviews: 'Reseñas y comentarios que publicas'
                    }
                },
                dataUse: {
                    title: 'Cómo Usamos tu Información',
                    items: {
                        service: 'Proporcionar y mejorar nuestros servicios',
                        communication: 'Comunicarnos contigo sobre actualizaciones y ofertas',
                        improvement: 'Analizar el uso de la plataforma para mejorar la experiencia',
                        security: 'Mantener la seguridad y prevenir fraudes'
                    }
                },
                dataProtection: {
                    title: 'Protección de Datos',
                    content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración.'
                },
                userRights: {
                    title: 'Tus Derechos',
                    items: {
                        access: 'Acceder a tus datos personales',
                        correction: 'Corregir información inexacta',
                        deletion: 'Solicitar la eliminación de tus datos',
                        portability: 'Obtener una copia de tus datos'
                    }
                },
                contact: {
                    title: 'Contacto',
                    content: 'Si tienes preguntas sobre esta política de privacidad, contáctanos a través de nuestro formulario de contacto.'
                }
            },
            cookies: {
                title: 'Política de Cookies',
                lastUpdated: 'Última actualización',
                intro: {
                    title: 'Introducción',
                    content: 'Esta política explica cómo EcoAventura utiliza cookies y tecnologías similares en nuestra plataforma.'
                },
                whatAre: {
                    title: '¿Qué son las Cookies?',
                    content: 'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Nos ayudan a mejorar tu experiencia y proporcionar funcionalidades personalizadas.'
                },
                types: {
                    title: 'Tipos de Cookies que Utilizamos',
                    essential: {
                        title: 'Cookies Esenciales',
                        content: 'Necesarias para el funcionamiento básico del sitio, como mantener tu sesión activa.'
                    },
                    functional: {
                        title: 'Cookies Funcionales',
                        content: 'Recuerdan tus preferencias, como el idioma seleccionado y configuraciones de accesibilidad.'
                    },
                    analytics: {
                        title: 'Cookies de Análisis',
                        content: 'Nos ayudan a entender cómo los usuarios interactúan con nuestra plataforma para mejorar la experiencia.'
                    }
                },
                management: {
                    title: 'Gestión de Cookies',
                    content: 'Puedes controlar y gestionar las cookies de las siguientes maneras:',
                    items: {
                        browser: 'Configurar tu navegador para rechazar o eliminar cookies',
                        preferences: 'Usar nuestro panel de preferencias de cookies',
                        thirdParty: 'Desactivar cookies de terceros en la configuración de tu navegador'
                    }
                },
                contact: {
                    title: 'Contacto',
                    content: 'Si tienes preguntas sobre nuestra política de cookies, no dudes en contactarnos.'
                }
            },

        },
        auth: {
            login: {
                title: 'Iniciar Sesión',
                subtitle: 'Accede a tu cuenta de EcoTurismo',
                email: 'Correo Electrónico',
                password: 'Contraseña',
                placeholderEmail: 'tu@email.com',
                placeholderPassword: '••••••••',
                rememberMe: 'Recordarme',
                forgotPassword: '¿Olvidaste tu contraseña?',
                submit: 'Iniciar Sesión',
                loading: 'Iniciando sesión...',
                noAccount: '¿No tienes cuenta?',
                register: 'Regístrate',
                error: 'Error al iniciar sesión'
            },
            register: {
                title: 'Crear Cuenta',
                subtitle: 'Únete a la comunidad de EcoTurismo',
                name: 'Nombre Completo',
                placeholderName: 'Tu nombre',
                confirmPassword: 'Confirmar Contraseña',
                submit: 'Registrarse',
                loading: 'Registrando...',
                hasAccount: '¿Ya tienes cuenta?',
                login: 'Inicia sesión',
                success: '¡Bienvenido {name}! Tu cuenta ha sido creada exitosamente.',
                error: 'Error al registrar',
                validation: {
                    nameRequired: 'El nombre es requerido',
                    emailRequired: 'El correo electrónico es requerido',
                    emailInvalid: 'El correo electrónico no es válido',
                    passwordRequired: 'La contraseña es requerida',
                    passwordMin: 'La contraseña debe tener al menos 6 caracteres',
                    passwordMax: 'La contraseña no puede tener más de 12 caracteres',
                    passwordMismatch: 'Las contraseñas no coinciden'
                }
            },
            forgotPassword: {
                title: 'Recuperar Contraseña',
                subtitle: '¿Olvidaste tu clave? No te preocupes.',
                backToLogin: 'Volver al inicio de sesión',
                backToLoginButton: 'VOLVER AL LOGIN',
                submit: 'Enviar Enlace de Recuperación',
                loading: 'Enviando...',
                successTitle: '¡Correo Enviado!',
                defaultSuccess: 'Enlace de recuperación enviado. Revisa tu correo.',
                defaultError: 'Error al enviar el enlace.'
            }
        }
    },
    en: {
        header: {
            home: 'Home',
            adminPanel: 'Admin Panel',
            partnerPanel: 'Partner Panel',
            myAccount: 'My Account',
            logout: 'Logout',
            login: 'Login',
            register: 'Register',
        },
        accessibility: {
            title: 'Accessibility',
            reset: 'Reset',
            fontSize: 'Text Size',
            invertColors: 'Invert Colors',
            grayscale: 'Grayscale',
            language: 'Language',
            options: 'Accessibility Options'
        },
        home: {
            hero: {
                subtitle: 'Discover Risaralda',
                title: 'Explore Paradise',
                highlight: 'Ecotourism',
                description: 'Immerse yourself in the magic of biodiversity. Find the most beautiful and sustainable destinations for your next nature adventure.',
                cta: 'Start Adventure'
            },
            map: {
                title: 'Destinations Map',
                subtitle: 'Locate your next experience',
                legend: 'Legend',
                available: 'Available destinations',
                hint: 'Click markers to view details',
                viewDetails: 'View details'
            },
            grid: {
                searchResults: 'Search Results',
                searching: 'Searching destinations...',
                allDestinations: 'All Destinations',
                found_one: 'destination found',
                found_other: 'destinations found',
                loading: 'Loading experiences...',
                noResultsTitle: 'No destinations found',
                noResultsDesc: 'Try another search or category'
            },
            filterBar: {
                placeholder: 'Search destinations...'
            },
            categories: {
                title: 'Explore by Category',
                subtitle: 'Discover destinations organized by experience type',
                reset: 'Reset',
                place_one: 'place',
                place_other: 'places',
                names: {
                    'avistamiento-de-aves': 'Bird Watching',
                    'senderismo': 'Hiking',
                    'paisaje-cultural-cafetero': 'Coffee Cultural Landscape',
                    'termales': 'Hot Springs',
                    'nevados-y-montanas': 'Snow-capped Mountains',
                    'cascadas': 'Waterfalls',
                    'glamping': 'Glamping',
                    'parques-tematicos': 'Theme Parks',
                    'rios-y-lagos': 'Rivers and Lakes',
                    'miradores': 'Viewpoints'
                }
            },
            card: {
                viewDetails: 'View Details',
                na: 'N/A',
                difficulty: {
                    'facil': 'Easy',
                    'media': 'Medium',
                    'dificil': 'Hard',
                    'Fácil': 'Easy',
                    'Media': 'Medium',
                    'Difícil': 'Hard'
                }
            },
            modal: {
                tabs: {
                    info: 'Info',
                    reviews: 'Reviews'
                },
                actions: {
                    addToFavorites: 'Add to Favorites',
                    removeFromFavorites: 'Remove from Favorites',
                    submitReview: 'Post Review',
                    submitting: 'Posting...'
                },
                info: {
                    description: 'Description',
                    location: 'Location',
                    coordinates: 'Coordinates',
                    difficulty_na: 'Difficulty N/A',
                    duration_na: 'Duration N/A',
                    season_na: 'Best season N/A'
                },
                reviews: {
                    title: 'Write a Review',
                    ratingLabel: 'Rating:',
                    placeholder: 'Share your experience...',
                    loginToReview: 'Log in to share your experience.',
                    usersReviewsTitle: 'Traveler Reviews',
                    noReviews: 'No reviews yet. Be the first!',
                    anonymous: 'Anonymous',
                    hiddenComment: 'This comment has been hidden by moderation.',
                    reviewsCount: 'reviews',
                    actions: {
                        edit: 'Edit',
                        delete: 'Delete',
                        save: 'Save',
                        cancel: 'Cancel',
                        confirmDeleteTitle: 'Delete review?',
                        confirmDeleteMessage: 'This action cannot be undone. Are you sure you want to delete this comment?'
                    }
                },
                messages: {
                    selectRating: 'Please select a rating',
                    success: 'Review submitted successfully!',
                    loginRequired: 'You must log in to save favorites',
                    error: 'An error occurred.'
                }
            },
            profile: {
                title: 'My Profile',
                personalInfo: 'Personal Information',
                security: 'Security',
                profilePhoto: 'Profile Photo',
                uploadNewPhoto: 'Upload New Photo',
                fullName: 'Full Name',
                email: 'Email Address',
                currentPassword: 'Current Password',
                newPassword: 'New Password',
                confirmPassword: 'Confirm Password',
                saving: 'Saving...',
                saveChanges: 'Save Changes',
                updatePassword: 'Update Password',
                messages: {
                    passwordMismatch: 'Passwords do not match',
                    profileUpdateSuccess: 'Profile updated successfully. Redirecting...',
                    profileUpdateError: 'Could not update profile.',
                    passwordUpdateSuccess: 'Password changed successfully. Please log in again with your new credentials.',
                    passwordUpdateError: 'Error updating password',
                    invalidData: 'Invalid data'
                }
            },
            dashboard: {
                welcome: {
                    hello: 'Hello',
                    subtitle: 'Welcome to your dashboard',
                    verifiedPartner: 'Verified Partner',
                    admin: 'Administrator',
                    explorer: 'Explorer',
                    editProfile: 'Edit Profile',
                    createPlace: 'Create Place'
                },
                stats: {
                    totalUsers: 'Total Users',
                    totalPlaces: 'Published Places',
                    pendingPlaces: 'Pending',
                    totalReviews: 'Total Reviews',
                    topRated: 'Top Rated',
                    mostPopular: 'Most Popular',
                    topCategory: 'Top Category',
                    basedOnReviews: 'Based on reviews',
                    mostFavorites: 'Most favorites',
                    mostPlaces: 'Most places',
                    noData: 'No data yet',
                    saved: 'saved',
                    places: 'places',
                    reviews: 'reviews',
                    myPlaces: 'My Publications',
                    approved: 'Approved',
                    inReview: 'In Review'
                },
                user: {
                    favoritePlaces: 'Favorite Places',
                    writtenReviews: 'Written Reviews',
                    myFavorites: 'My Favorites',
                    noFavoritesYet: 'You haven\'t saved any favorite places yet.',
                    exploreMap: 'Explore Map'
                },
                partner: {
                    manageDestinations: 'Manage Destinations',
                    manageSubtitle: 'Share the natural beauty with the world. Create new ecotourism destinations and manage existing ones from here.',
                    publishNew: 'Publish New Place',
                    myPublications: 'My Publications'
                },
                tables: {
                    place: 'Place',
                    partner: 'Partner',
                    status: 'Status',
                    actions: 'Actions',
                    user: 'User',
                    email: 'Email',
                    role: 'Role',
                    rating: 'Rating',
                    comment: 'Comment'
                },
                actions: {
                    approve: 'Approve',
                    reject: 'Reject',
                    changes: 'Changes',
                    view: 'View',
                    delete: 'Delete',
                    edit: 'Edit',
                    create: 'Create',
                    cancel: 'Cancel',
                    save: 'Save Changes',
                    hide: 'Hide',
                    show: 'Show'
                },
                status: {
                    pending: 'Pending',
                    approved: 'Approved',
                    rejected: 'Rejected',
                    needs_fix: 'Needs Fix',
                    published: 'Published',
                    hidden: 'Hidden',
                    visible: 'Visible'
                },
                messages: {
                    loading: 'Loading...',
                    approveSuccess: 'Place approved successfully',
                    approveError: 'Error approving place',
                    rejectSuccess: 'Place rejected successfully',
                    rejectError: 'Error rejecting place',
                    deleteSuccess: 'Place deleted successfully',
                    deleteError: 'Error deleting place',
                    statusSuccess: 'Status updated successfully',
                    statusError: 'Error changing status',
                    changesSuccess: 'Change request sent successfully',
                    changesError: 'Error sending request',
                    allUpToDate: 'All up to date! No places pending review.',
                    confirmApprove: 'Are you sure you want to approve this place?',
                    confirmReject: 'Are you sure you want to reject this place?',
                    confirmDelete: 'Are you sure you want to delete this place? This action cannot be undone.',
                    confirmChanges: 'Does the place require corrections from the partner?',
                    confirmStatus: 'Are you sure you want to change the status to'
                },
                sections: {
                    pendingPlaces: 'Places Pending Approval',
                    manageAll: 'Manage All Places',
                    userManagement: 'User Management',
                    reviewModeration: 'Review Moderation',
                    adminOnly: 'Admin Only'
                },
                adminUsers: {
                    createNew: 'Create New User',
                    editUser: 'Edit User',
                    deleteUser: 'Delete User',
                    confirmDelete: 'Are you sure you want to delete this user? This action cannot be undone.',
                    form: {
                        name: 'Name',
                        email: 'Email',
                        role: 'Role',
                        password: 'Password',
                        repeatPassword: 'Repeat Password',
                        selectRole: 'Select Role'
                    },
                    roles: {
                        admin: 'Administrator',
                        partner: 'Partner',
                        user: 'User'
                    },
                    messages: {
                        created: 'User created successfully',
                        updated: 'User updated successfully',
                        deleted: 'User deleted successfully',
                        error: 'Operation failed',
                        passwordsDoNotMatch: 'Passwords do not match'
                    }
                },
                adminReviews: {
                    place: 'Place',
                    user: 'User',
                    rating: 'Rating',
                    comment: 'Comment',
                    status: 'Status',
                    action: 'Action',
                    hide: 'Hide',
                    show: 'Show',
                    hidden: 'Hidden',
                    visible: 'Visible',
                    confirmHide: 'Hide this comment?',
                    confirmShow: 'Show this comment?',
                    messages: {
                        statusChanged: 'Review status updated',
                        error: 'Error updating status'
                    }
                }
            },
            footer: {
                rights: 'All rights reserved.'
            },

        },
        auth: {
            login: {
                title: 'Login',
                subtitle: 'Access your EcoTurismo account',
                email: 'Email Address',
                password: 'Password',
                placeholderEmail: 'you@email.com',
                placeholderPassword: '••••••••',
                rememberMe: 'Remember me',
                forgotPassword: 'Forgot your password?',
                submit: 'Login',
                loading: 'Logging in...',
                noAccount: 'Don\'t have an account?',
                register: 'Register',
                error: 'Error logging in'
            },
            register: {
                title: 'Create Account',
                subtitle: 'Join the EcoTurismo community',
                name: 'Full Name',
                placeholderName: 'Your name',
                confirmPassword: 'Confirm Password',
                submit: 'Register',
                loading: 'Registering...',
                hasAccount: 'Already have an account?',
                login: 'Login',
                success: 'Welcome {name}! Your account has been created successfully.',
                error: 'Error registering',
                validation: {
                    nameRequired: 'Name is required',
                    emailRequired: 'Email is required',
                    emailInvalid: 'Email is invalid',
                    passwordRequired: 'Password is required',
                    passwordMin: 'Password must be at least 6 characters',
                    passwordMax: 'Password cannot be more than 12 characters',
                    passwordMismatch: 'Passwords do not match'
                }
            },
            forgotPassword: {
                title: 'Recover Password',
                subtitle: 'Forgot your key? Don\'t worry.',
                backToLogin: 'Back to login',
                backToLoginButton: 'BACK TO LOGIN',
                submit: 'Send Recovery Link',
                loading: 'Sending...',
                successTitle: 'Email Sent!',
                defaultSuccess: 'Recovery link sent. Check your email.',
                defaultError: 'Error sending link.'
            }
        },
        footer: {
            rights: 'All rights reserved.',
            privacy: 'Privacy',
            cookies: 'Cookies'
        },
        privacy: {
            title: 'Privacy Policy',
            lastUpdated: 'Last updated',
            intro: {
                title: 'Introduction',
                content: 'At EcoAventura, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information.'
            },
            dataCollection: {
                title: 'Information We Collect',
                intro: 'We collect the following information when you use our services:',
                items: {
                    name: 'Name and contact information',
                    email: 'Email address',
                    profile: 'Profile information and preferences',
                    reviews: 'Reviews and comments you post'
                }
            },
            dataUse: {
                title: 'How We Use Your Information',
                items: {
                    service: 'Provide and improve our services',
                    communication: 'Communicate with you about updates and offers',
                    improvement: 'Analyze platform usage to improve experience',
                    security: 'Maintain security and prevent fraud'
                }
            },
            dataProtection: {
                title: 'Data Protection',
                content: 'We implement technical and organizational security measures to protect your personal data against unauthorized access, loss, or alteration.'
            },
            userRights: {
                title: 'Your Rights',
                items: {
                    access: 'Access your personal data',
                    correction: 'Correct inaccurate information',
                    deletion: 'Request deletion of your data',
                    portability: 'Obtain a copy of your data'
                }
            },
            contact: {
                title: 'Contact',
                content: 'If you have questions about this privacy policy, contact us through our contact form.'
            }
        },
        cookies: {
            title: 'Cookies Policy',
            lastUpdated: 'Last updated',
            intro: {
                title: 'Introduction',
                content: 'This policy explains how EcoAventura uses cookies and similar technologies on our platform.'
            },
            whatAre: {
                title: 'What are Cookies?',
                content: 'Cookies are small text files stored on your device when you visit a website. They help us improve your experience and provide personalized features.'
            },
            types: {
                title: 'Types of Cookies We Use',
                essential: {
                    title: 'Essential Cookies',
                    content: 'Necessary for basic site functionality, such as keeping your session active.'
                },
                functional: {
                    title: 'Functional Cookies',
                    content: 'Remember your preferences, such as selected language and accessibility settings.'
                },
                analytics: {
                    title: 'Analytics Cookies',
                    content: 'Help us understand how users interact with our platform to improve the experience.'
                }
            },
            management: {
                title: 'Cookie Management',
                content: 'You can control and manage cookies in the following ways:',
                items: {
                    browser: 'Configure your browser to reject or delete cookies',
                    preferences: 'Use our cookie preferences panel',
                    thirdParty: 'Disable third-party cookies in your browser settings'
                }
            },
            contact: {
                title: 'Contact',
                content: 'If you have questions about our cookie policy, feel free to contact us.'
            }
        }
    }
};
