import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Activity, Bell, FileText, Settings } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { useSettings } from '@/contexts/settings-context';

export function AppSidebar() {
    const { t } = useSettings();

    const mainNavItems = [
        {
            title: t('dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('customer_management'),
            href: '/customers',
            icon: Users,
        },
        {
            title: t('service_monitoring'),
            href: '/service-monitoring',
            icon: Activity,
        },
        {
            title: t('notifications'),
            href: '/notifications',
            icon: Bell,
        },
        {
            title: t('content_manager'),
            href: '/content-manager',
            icon: FileText,
        },
        {
            title: t('admin_settings'),
            href: '/admin-settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-[#f4f5f7] dark:bg-[#111111] border-r border-gray-200 dark:border-slate-800 transition-colors duration-300">
            <SidebarHeader className="pt-6 pb-4 px-6 border-b border-transparent">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent bg-transparent active:bg-transparent">
                            <Link href={dashboard()} prefetch className="flex items-center gap-2">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-4 py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 dark:border-slate-800 p-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
