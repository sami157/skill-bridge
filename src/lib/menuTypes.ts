const menuByRole = {
    STUDENT: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Bookings', href: '/dashboard/bookings' },
        { label: 'Profile', href: '/dashboard/profile' },
    ],
    TUTOR: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Sessions', href: '/dashboard/bookings' },
        { label: 'Availability', href: '/dashboard/tutor/availability' },
        { label: 'Profile', href: '/dashboard/tutor/profile' },
    ],
    ADMIN: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Users', href: '/dashboard/admin/users' },
        { label: 'Bookings', href: '/dashboard/admin/bookings' },
        { label: 'Categories', href: '/dashboard/admin/categories' },
    ],
};

export default menuByRole