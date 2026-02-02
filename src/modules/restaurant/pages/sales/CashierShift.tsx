import { useState, useMemo } from 'react';
import { useStore } from '../../../../lib/restaurant-lib/store';
import { useTranslation } from '../../../../lib/restaurant-lib/useTranslation';
import { 
  Clock, DollarSign, TrendingUp, Package, 
  PlayCircle, StopCircle, AlertCircle, CheckCircle 
} from 'lucide-react';

export function CashierShift() {
  const { shifts, openShift, closeShift } = useStore();
  const { t } = useTranslation();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [shiftNote, setShiftNote] = useState('');

  const currentShift = shifts.find(s => s.status === 'open');
  const closedShifts = shifts.filter(s => s.status === 'closed').slice(0, 5);

  const currentShiftStats = useMemo(() => {
    if (!currentShift) return null;

    const shiftOrders = JSON.parse(localStorage.getItem('pos-orders') || '[]')
      .filter((o: any) => {
        const orderTime = new Date(o.timestamp).getTime();
        const shiftStart = new Date(currentShift.startTime).getTime();
        return orderTime >= shiftStart;
      });

    const revenue = shiftOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const orders = shiftOrders.length;
    const items = shiftOrders.reduce((sum: number, o: any) => 
      sum + o.items.reduce((s: number, i: any) => s + i.quantity, 0), 0);

    const duration = Math.floor((Date.now() - new Date(currentShift.startTime).getTime()) / 60000);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return { revenue, orders, items, hours, minutes };
  }, [currentShift]);

  const handleOpenShift = () => {
    const cash = parseFloat(openingCash);
    if (isNaN(cash) || cash < 0) {
      alert(t.enterOpeningCash);
      return;
    }

    openShift(cash, 'Cashier');
    setShowOpenModal(false);
    setOpeningCash('');
  };

  const handleCloseShift = () => {
    if (!currentShift) return;

    const cash = parseFloat(closingCash);
    if (isNaN(cash) || cash < 0) {
      alert(t.enterClosingCash);
      return;
    }

    closeShift(currentShift.id, cash, shiftNote);
    setShowCloseModal(false);
    setClosingCash('');
    setShiftNote('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Current Shift Status */}
        {currentShift ? (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {t.active} {t.shift}
                  </span>
                </div>
                <h2 className="text-3xl font-bold">{t.currentShift}</h2>
                <p className="text-green-100 mt-1">
                  {t.openedBy}: {currentShift.openedBy}
                </p>
              </div>
              <button
                onClick={() => setShowCloseModal(true)}
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
              >
                <StopCircle className="w-5 h-5 inline mr-2" />
                {t.closeShift}
              </button>
            </div>

            {/* Shift Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.duration}</span>
                </div>
                <p className="text-2xl font-bold">
                  {currentShiftStats?.hours}h {currentShiftStats?.minutes}m
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.revenue}</span>
                </div>
                <p className="text-2xl font-bold">
                  {currentShiftStats?.revenue.toLocaleString()}đ
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.orders}</span>
                </div>
                <p className="text-2xl font-bold">{currentShiftStats?.orders}</p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.items}</span>
                </div>
                <p className="text-2xl font-bold">{currentShiftStats?.items}</p>
              </div>
            </div>

            {/* Opening Cash */}
            <div className="mt-4 bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-sm font-medium mb-1">{t.openingCash}</p>
              <p className="text-2xl font-bold">
                {currentShift.openingCash.toLocaleString()}đ
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">{t.noActiveShift}</h2>
            <p className="text-blue-100 mb-6">
              {t.openShiftToStart || 'Open a shift to start working'}
            </p>
            <button
              onClick={() => setShowOpenModal(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              <PlayCircle className="w-6 h-6 inline mr-2" />
              {t.openShift}
            </button>
          </div>
        )}

        {/* Recent Shifts */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t.shiftHistory}
          </h3>

          {closedShifts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.noShifts}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {closedShifts.map((shift) => {
                const duration = Math.floor(
                  (new Date(shift.endTime!).getTime() - new Date(shift.startTime).getTime()) / 60000
                );
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                const difference = (shift.closingCash || 0) - shift.expectedCash;

                return (
                  <div
                    key={shift.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(shift.startTime).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(shift.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - {new Date(shift.endTime!).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {hours}h {minutes}m
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {shift.revenue.toLocaleString()}đ
                        </p>
                        <p className="text-sm text-gray-500">
                          {shift.orders} {t.orders}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">{t.openingCash}</p>
                        <p className="font-semibold">{shift.openingCash.toLocaleString()}đ</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">{t.closingCash}</p>
                        <p className="font-semibold">{(shift.closingCash || 0).toLocaleString()}đ</p>
                      </div>
                      <div className={`rounded p-2 ${
                        difference === 0 
                          ? 'bg-green-50' 
                          : difference > 0 
                          ? 'bg-blue-50' 
                          : 'bg-red-50'
                      }`}>
                        <p className="text-gray-500">{t.difference}</p>
                        <p className={`font-semibold ${
                          difference === 0 
                            ? 'text-green-600' 
                            : difference > 0 
                            ? 'text-blue-600' 
                            : 'text-red-600'
                        }`}>
                          {difference > 0 && '+'}
                          {difference.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Open Shift Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t.openShift}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.openingCash}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t.enterOpeningCash}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOpenModal(false);
                  setOpeningCash('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleOpenShift}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t.openShift}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseModal && currentShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t.closeShift}
            </h3>

            {/* Summary */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">{t.revenue}</p>
                  <p className="font-bold text-lg">{currentShiftStats?.revenue.toLocaleString()}đ</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">{t.orders}</p>
                  <p className="font-bold text-lg">{currentShiftStats?.orders}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.closingCash}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.note} ({t.optional})
              </label>
              <textarea
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
                placeholder={t.shiftNote}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setClosingCash('');
                  setShiftNote('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCloseShift}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                {t.closeShift}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}