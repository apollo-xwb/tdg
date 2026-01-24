
import React, { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<any>(null);

  const trackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    // Simulated Mock Logic
    setStatus({
      id: orderId.toUpperCase(),
      current: 'Crafting',
      steps: [
        { name: 'Order Placed', date: 'Oct 12, 2023', completed: true },
        { name: 'Sourcing Stone', date: 'Oct 14, 2023', completed: true },
        { name: 'Master Crafting', date: 'In Progress', completed: false },
        { name: 'Quality Assurance', date: 'Pending', completed: false },
        { name: 'Ready for Collection', date: 'Pending', completed: false }
      ]
    });

    console.log(`[HubSpot Simulation] Tracking order ${orderId} initialized.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-thin tracking-tight uppercase mb-4">Track Your Brilliance</h2>
        <p className="text-gray-400 font-light max-w-lg mx-auto">Enter your Order ID provided in your design summary or via email.</p>
      </div>

      <form onSubmit={trackOrder} className="flex gap-4 mb-20 max-w-xl mx-auto">
        <input 
          type="text" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="TDG-XXXXX"
          className="flex-grow bg-white/5 border border-white/10 px-6 py-4 rounded-sm text-sm uppercase tracking-widest focus:outline-none focus:border-white transition-all"
        />
        <button className="bg-white text-black px-8 flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:bg-gray-200 transition-all">
          <Search size={16} /> Track
        </button>
      </form>

      {status && (
        <div className="animate-fadeIn bg-white/5 border border-white/10 p-12 rounded-sm">
          <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Tracking ID</p>
              <h3 className="text-xl font-light">{status.id}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
              <span className="text-xs uppercase tracking-widest bg-white text-black px-3 py-1 font-medium">{status.current}</span>
            </div>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/10 z-0"></div>
            {status.steps.map((step: any, i: number) => (
              <div key={i} className="flex items-center gap-8 relative z-10">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  step.completed ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-[#121212] border-white/20 text-gray-600'
                }`}>
                  {i === 0 && <Package size={18} />}
                  {i === 1 && <Search size={18} />}
                  {i === 2 && <Clock size={18} />}
                  {i === 3 && <CheckCircle size={18} />}
                  {i === 4 && <Truck size={18} />}
                </div>
                <div>
                  <h4 className={`text-sm uppercase tracking-widest ${step.completed ? 'text-white' : 'text-gray-600'}`}>
                    {step.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-tighter">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
