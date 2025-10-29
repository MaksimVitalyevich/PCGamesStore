import { trigger, transition, style, animate, state } from "@angular/animations";

/** Смена темы (Светлый <-> Темный) */
export const themeColorAnim = trigger('themeColorAnim', [
    state('light', style({ backgroundColor: '#ffffff', color: '#000'})),
    state('dark', style({ backgroundColor: '#222', color: '#fff' })),
    transition('light <=> dark', [
        animate('500ms ease-in-out')
    ])
]);

/** Плавное осветление заднего фона */
export const brightnessAnim = trigger('brightnessAnim', [
    state('normal', style({ filter: 'brightness(1)' })),
    state('hover', style({ filter: 'brightness(1.15)' })),
    transition('normal <=> hover', animate('400ms ease'))
]);

/** Плавное изменение цвета текста */
export const textColorAnim = trigger('textColorAnim', [
    state('normal', style({ color: 'var(--accent-purple)' })),
    state('hover', style({ color: 'var(--accent-purple-hover)' })),
    transition('normal <=> hover', animate('300ms ease'))
]);

/** Плавный "выезд" заголовка всего сайта (слева) */
export const headerSlideIn = trigger('headerSlideIn', [
    transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
    ])
]);
/** Плавный "выезд" боковой панели (справа) */
export const sidebarSlideIn = trigger('sidebarSlideIn', [
    transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
    ])
])

/** Плавное появление/исчезновение вкладок ПК игр с затемнением при наведении */
export const gameCardAnim = trigger('gameCardAnim', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(25px)' }))
    ]),
    state('hover', style({ filter: 'brightness(0.9)' })),
    state('normal', style({ filter: 'brightness(1)' }))
]);

/** Плавное появление/исчезновение модального окна с увеличением при наведении */
export const modalAnims = trigger('modalAnims', [
    transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
    ]),
    transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
    ])
]);

export const gameEditAnim = trigger('gameEditAnim', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(15px)' }))
    ])
]);

/** Плавное появление поля покупок игр */
export const purchaseFieldAnim = trigger('purchaseFieldAnim', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
]);

/** Плавное появление/исчезновение информационного блока пользователя с увеличением при наведении */
export const userInfoAnims = trigger('userInfoAnims', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
    ]),
    state('hover', style({ transform: 'scale(1.05)' })),
    state('normal', style({ transform: 'scale(1)' }))
]);

