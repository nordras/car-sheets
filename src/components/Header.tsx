import { Car, Users, UserCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'quotations', label: 'Cotações', icon: FileText },
  { id: 'vehicles', label: 'Veículos', icon: Car },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'sellers', label: 'Vendedores', icon: UserCircle },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="gradient-primary text-primary-foreground shadow-elevated">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src="/logo.png" 
              alt="QA Logo" 
              className="h-10 w-auto md:h-14 object-contain"
            />
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">Sistema de Cotações</h1>
              <p className="text-xs md:text-sm text-primary-foreground/80 hidden sm:block">
                Gestão de Quotações Automotivas
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-4 md:mt-6 flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 md:gap-2 rounded-t-lg px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-card'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
