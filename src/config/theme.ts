import { siteConfig } from "@/config/site.config";

const theme = siteConfig.theme;

export const themeCss = `:root{--background:${theme.background};--foreground:${theme.foreground};--card:${theme.card};--card-foreground:${theme.cardForeground};--popover:${theme.popover};--popover-foreground:${theme.popoverForeground};--primary:${theme.primary};--primary-foreground:${theme.primaryForeground};--secondary:${theme.secondary};--secondary-foreground:${theme.secondaryForeground};--muted:${theme.muted};--muted-foreground:${theme.mutedForeground};--accent:${theme.accent};--accent-foreground:${theme.accentForeground};--destructive:${theme.destructive};--destructive-foreground:${theme.destructiveForeground};--border:${theme.border};--input:${theme.input};--ring:${theme.ring};--radius:${theme.radius};}`;
