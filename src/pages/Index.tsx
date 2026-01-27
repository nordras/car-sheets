import { useState } from 'react';
import { Header } from '@/components/Header';
import { VehiclesTab } from '@/components/VehiclesTab';
import { ClientsTab } from '@/components/ClientsTab';
import { SellersTab } from '@/components/SellersTab';
import { QuotationsTab } from '@/components/QuotationsTabNew';

const Index = () => {
  const [activeTab, setActiveTab] = useState('quotations');

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'quotations' && <QuotationsTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'clients' && <ClientsTab />}
        {activeTab === 'sellers' && <SellersTab />}
      </main>
    </div>
  );
};

export default Index;
