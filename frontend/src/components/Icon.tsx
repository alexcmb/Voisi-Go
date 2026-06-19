import type { SVGProps, ReactNode } from 'react';

/**
 * Jeu d'icônes au trait (stroke = currentColor), pour remplacer les emojis.
 * Style cohérent : 24x24, trait 1.75, extrémités arrondies.
 */
export type IconName =
    | 'search' | 'sparkle' | 'bell' | 'message' | 'sun' | 'moon'
    | 'user' | 'car' | 'hands' | 'leaf' | 'shield' | 'arrow-right'
    | 'check' | 'close' | 'menu' | 'logout' | 'home' | 'ticket'
    | 'flag' | 'star' | 'map-pin' | 'login' | 'help';

type Props = SVGProps<SVGSVGElement> & {
    name: IconName;
    size?: number;
};

const PATHS: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
    sparkle: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    message: <path d="M4 5h16v11H8l-4 3z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    car: <><path d="M4 13l1.6-4.2A2 2 0 0 1 7.5 7.5h9a2 2 0 0 1 1.9 1.3L20 13v5h-2.5v-2h-11v2H4z" /><circle cx="7.5" cy="15.5" r="1" /><circle cx="16.5" cy="15.5" r="1" /></>,
    hands: <path d="M3 12l4-1 3 2 4-4 3 1 4-1v5l-4 1-3-1-4 3-3-2-4 1z" />,
    leaf: <><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14Z" /><path d="M5 19c3-5 7-8 11-9" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
    'arrow-right': <path d="M5 12h13m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    logout: <><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M9 12h11m-4-4 4 4-4 4" /></>,
    home: <path d="M4 11l8-7 8 7M6 10v9h12v-9" />,
    ticket: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M9 6v12" /></>,
    flag: <><path d="M6 21V4" /><path d="M6 4h11l-2 3 2 3H6" /></>,
    star: <path d="M12 4l2.3 4.9 5.2.6-3.9 3.6 1.1 5.3L12 16.2 7.2 18.4l1.1-5.3L4.4 9.5l5.2-.6z" />,
    'map-pin': <><path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.2" /></>,
    login: <><path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><path d="M14 12H3m8-4-8 4 8 4" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" /><path d="M12 17.5h.01" /></>,
};

export default function Icon({ name, size = 20, ...rest }: Props) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...rest}
        >
            {PATHS[name]}
        </svg>
    );
}
