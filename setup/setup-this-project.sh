
echo "=== START SETUP PROCCESS ==="
pnpm create next-app@latest koreksi-in --typescript --tailwind --eslint


cd koreksi-in


pnpm dlx shadcn@latest init


# Install Supabase & Lucide Icons
pnpm add @supabase/supabase-js @supabase/ssr lucide-react

# Install komponen Shadcn yang sering dipakai
pnpm dlx shadcn@latest add button card input dialog table badge toast

echo "=== END SETUP PROCCESS ==="
