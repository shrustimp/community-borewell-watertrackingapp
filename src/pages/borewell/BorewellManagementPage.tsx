import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getBorewells,
  getBorewellUsage,
  saveBorewell,
  logBorewellUsage,
  subscribeToStore,
} from '../../services/storageService';
import { Borewell, BorewellUsage } from '../../types';
import {
  Activity,
  Plus,
  Download,
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  MapPin,
  TrendingUp,
  Info,
  Filter,
  Search,
} from 'lucide-react';

export const BorewellManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [borewells, setBorewells] = useState<Borewell[]>([]);
  const [usageLogs, setUsageLogs] = useState<BorewellUsage[]>([]);
  const [selectedBorewellId, setSelectedBorewellId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Usage Form
  const [newLog, setNewLog] = useState({
    borewellId: '',
    date: new Date().toISOString().split('T')[0],
    time: '06:00 AM - 08:30 AM',
    openingMeterReading: 1456.0,
    closingMeterReading: 1468.0,
    purpose: 'overhead_tank' as BorewellUsage['purpose'],
    householdOrWingRef: 'Blocks A & B Domestic Tanks',
    notes: 'Morning routine pumping cycle.',
  });

  // New Borewell Form
  const [newBw, setNewBw] = useState({
    name: '',
    communityName: 'Green Glen Layout Association',
    location: '',
    depthFeet: 750,
    totalEstimatedCapacityLiters: 20000,
    responsibleManager: currentUser?.fullName || 'Community Manager',
    managerPhone: currentUser?.phone || '+91 98440 12345',
    operationalStatus: 'active' as Borewell['operationalStatus'],
    pumpHorsepower: 7.5,
  });

  const loadData = () => {
    const bws = getBorewells();
    setBorewells(bws);
    if (bws.length > 0 && !newLog.borewellId) {
      setNewLog((prev) => ({ ...prev, borewellId: bws[0].borewellId }));
    }
    setUsageLogs(getBorewellUsage());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return unsub;
  }, []);

  // Filtered Logs
  const filteredLogs = usageLogs.filter((log) => {
    const matchBw = selectedBorewellId === 'all' || log.borewellId === selectedBorewellId;
    const matchDate = !dateFilter || log.date === dateFilter;
    return matchBw && matchDate;
  });

  // Analytics
  const totalWaterExtractedLiters = filteredLogs.reduce(
    (sum, l) => sum + l.quantityUsedLiters,
    0
  );
  const totalPumpingSessions = filteredLogs.length;
  const avgSessionLiters =
    totalPumpingSessions > 0
      ? Math.round(totalWaterExtractedLiters / totalPumpingSessions)
      : 0;

  // Anomaly check: any run with > 15,000L or unusually high consumption
  const highConsumptionSpikes = filteredLogs.filter((l) => l.quantityUsedLiters >= 15000);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetBw = borewells.find((b) => b.borewellId === newLog.borewellId);
    if (!targetBw) return setFormError('Select a valid borewell');

    if (newLog.closingMeterReading < newLog.openingMeterReading) {
      return setFormError('Closing meter reading cannot be lower than opening reading');
    }

    const res = logBorewellUsage({
      borewellId: targetBw.borewellId,
      borewellName: targetBw.name,
      date: newLog.date,
      time: newLog.time,
      openingMeterReading: Number(newLog.openingMeterReading),
      closingMeterReading: Number(newLog.closingMeterReading),
      purpose: newLog.purpose,
      householdOrWingRef: newLog.householdOrWingRef,
      recordedBy: currentUser?.fullName || 'Water Commitee Member',
      notes: newLog.notes,
    });

    if (res.success) {
      setShowLogModal(false);
      setSuccessMsg('Meter reading logged successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      // Update default opening reading for next log
      setNewLog((prev) => ({
        ...prev,
        openingMeterReading: Number(newLog.closingMeterReading),
        closingMeterReading: Number(newLog.closingMeterReading) + 12,
      }));
    } else {
      setFormError(res.error || 'Failed to record usage');
    }
  };

  const handleRegisterBorewell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBw.name.trim()) return setFormError('Borewell name is required');
    if (!newBw.location.trim()) return setFormError('Location is required');

    saveBorewell({
      name: newBw.name,
      communityName: newBw.communityName,
      location: newBw.location,
      depthFeet: Number(newBw.depthFeet),
      totalEstimatedCapacityLiters: Number(newBw.totalEstimatedCapacityLiters),
      responsibleManager: newBw.responsibleManager,
      managerPhone: newBw.managerPhone,
      operationalStatus: newBw.operationalStatus,
      pumpHorsepower: Number(newBw.pumpHorsepower),
      lastInspectionDate: new Date().toISOString().split('T')[0],
    });

    setShowRegisterModal(false);
    setSuccessMsg('New community borewell registered!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Usage ID',
      'Borewell Name',
      'Date',
      'Pumping Time Window',
      'Opening Meter Reading (kL)',
      'Closing Meter Reading (kL)',
      'Quantity Used (Liters)',
      'Purpose',
      'Community / Tank Reference',
      'Recorded By',
      'Notes',
    ];

    const rows = filteredLogs.map((l) => [
      l.usageId,
      `"${l.borewellName.replace(/"/g, '""')}"`,
      l.date,
      `"${l.time}"`,
      l.openingMeterReading,
      l.closingMeterReading,
      l.quantityUsedLiters,
      l.purpose,
      `"${l.householdOrWingRef.replace(/"/g, '""')}"`,
      `"${l.recordedBy}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JalaConnect_Borewell_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 text-left">
      {/* Disclaimer banner grounded per guidelines */}
      <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Community Groundwater Metering Policy:</strong> This module records verified community flow-meter measurements and pump operation durations. It tracks actual extracted water volumes to prevent aquifer depletion and motor burnout; it does not display unverified underground live sensor claims.
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Groundwater Conservation & Metering
          </span>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
            Community Borewell Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Audit shared wellhead extraction, log daily pump meter readings, and export compliance reports for resident associations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Meter Reading
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Register Borewell
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Total Extracted (Filtered)</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {(totalWaterExtractedLiters / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">kL</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{totalWaterExtractedLiters.toLocaleString()} Liters</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Registered Borewells</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{borewells.length}</p>
          <span className="text-[11px] text-teal-600 font-medium mt-0.5 block">
            {borewells.filter((b) => b.operationalStatus === 'active').length} actively pumping
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Average Run Volume</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {avgSessionLiters.toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">across {totalPumpingSessions} logged cycles</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">High-Demand Runs</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {highConsumptionSpikes.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cycles ≥ 15,000 Liters</span>
        </div>
      </div>

      {/* Abnormal Spike Warning Alert if detected */}
      {highConsumptionSpikes.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>High Consumption Flagged:</strong> {highConsumptionSpikes.length} pumping cycle(s) recorded more than 15,000L in a single session. If this exceeds normal overhead tank capacity, please inspect underground distribution lines for potential leakages.
          </div>
        </div>
      )}

      {/* Borewells Registry Cards */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-3">Community Wellhead Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {borewells.map((bw) => (
            <div
              key={bw.borewellId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block">{bw.borewellId}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{bw.name}</h3>
                  <p className="text-[11px] text-slate-500">{bw.communityName}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    bw.operationalStatus === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : bw.operationalStatus === 'low_yield'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bw.operationalStatus.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Depth:</span>
                  <strong>{bw.depthFeet} Feet</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Motor Power:</span>
                  <strong>{bw.pumpHorsepower} HP</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{bw.location}</span>
                </div>
                <div className="text-slate-500">
                  Manager: {bw.responsibleManager} ({bw.managerPhone})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar & Usage Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recorded Pumping Meter Readings</h3>
            <p className="text-xs text-slate-500">
              Audit logs with opening meter, closing meter, and net consumption
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBorewellId}
              onChange={(e) => setSelectedBorewellId(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-300 rounded-xl text-slate-800"
            >
              <option value="all">All Borewells</option>
              {borewells.map((b) => (
                <option key={b.borewellId} value={b.borewellId}>
                  {b.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="py-1.5 px-3 text-xs border border-slate-300 rounded-xl text-slate-800"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No meter readings found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Borewell</th>
                  <th className="py-3 px-3">Opening (kL)</th>
                  <th className="py-3 px-3">Closing (kL)</th>
                  <th className="py-3 px-3">Volume Extracted</th>
                  <th className="py-3 px-3">Purpose & Target</th>
                  <th className="py-3 px-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.usageId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {log.date}
                      <span className="text-[10px] text-slate-400 block font-normal">{log.time}</span>
                    </td>
                    <td className="py-3 px-3">{log.borewellName}</td>
                    <td className="py-3 px-3 font-mono">{log.openingMeterReading.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono">{log.closingMeterReading.toFixed(1)}</td>
                    <td className="py-3 px-3">
                      <strong className="text-blue-700 font-bold">
                        {log.quantityUsedLiters.toLocaleString()} Liters
                      </strong>
                      <span className="text-[10px] text-slate-400 block">
                        {(log.quantityUsedLiters / 1000).toFixed(1)} kL
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 capitalize">
                        {log.purpose.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                        {log.householdOrWingRef}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {log.recordedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Meter Reading Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Log Daily Borewell Pump Meter Reading</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400">✕</button>
            </div>

            {formError && <p className="text-red-600 bg-red-50 p-2 rounded-lg">{formError}</p>}

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Borewell *</label>
                <select
                  value={newLog.borewellId}
                  onChange={(e) => setNewLog({ ...newLog, borewellId: e.target.value })}
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                >
                  {borewells.map((b) => (
                    <option key={b.borewellId} value={b.borewellId}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pumping Window *</label>
                  <input
                    type="text"
                    required
                    value={newLog.time}
                    onChange={(e) => setNewLog({ ...newLog, time: e.target.value })}
                    placeholder="06:00 AM - 08:30 AM"
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opening Meter (kL) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLog.openingMeterReading}
                    onChange={(e) => setNewLog({ ...newLog, openingMeterReading: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Closing Meter (kL) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLog.closingMeterReading}
                    onChange={(e) => setNewLog({ ...newLog, closingMeterReading: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex justify-between items-center text-teal-950">
                <span>Calculated Extraction Volume:</span>
                <strong className="text-base text-teal-800">
                  {Math.max(0, Math.round((newLog.closingMeterReading - newLog.openingMeterReading) * 1000)).toLocaleString()} Liters
                </strong>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pumping Purpose</label>
                <select
                  value={newLog.purpose}
                  onChange={(e) => setNewLog({ ...newLog, purpose: e.target.value as any })}
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                >
                  <option value="overhead_tank">Overhead Domestic Tank Refill</option>
                  <option value="drinking_supply">Purification / Drinking Water</option>
                  <option value="gardening_groundwater">Community Garden / Irrigation</option>
                  <option value="emergency_community">Emergency Community Supply</option>
                  <option value="construction_maintenance">Maintenance / Flushing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wing / Tank Reference *</label>
                <input
                  type="text"
                  required
                  value={newLog.householdOrWingRef}
                  onChange={(e) => setNewLog({ ...newLog, householdOrWingRef: e.target.value })}
                  placeholder="e.g. Block A & B Tanks, Sector 2"
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Notes</label>
                <input
                  type="text"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  placeholder="e.g. Clean flow, pump vibration normal"
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md"
                >
                  Save Meter Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Borewell Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Register Community Shared Borewell</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleRegisterBorewell} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Borewell Identifier / Name *</label>
                <input
                  type="text"
                  required
                  value={newBw.name}
                  onChange={(e) => setNewBw({ ...newBw, name: e.target.value })}
                  placeholder="e.g. Borewell #4 (South Park Line)"
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Community / Apartment Name *</label>
                <input
                  type="text"
                  required
                  value={newBw.communityName}
                  onChange={(e) => setNewBw({ ...newBw, communityName: e.target.value })}
                  placeholder="e.g. Green Glen Layout Association"
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Location *</label>
                <input
                  type="text"
                  required
                  value={newBw.location}
                  onChange={(e) => setNewBw({ ...newBw, location: e.target.value })}
                  placeholder="e.g. Near Gate 3 Park, Sector 4"
                  className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Depth (Feet)</label>
                  <input
                    type="number"
                    value={newBw.depthFeet}
                    onChange={(e) => setNewBw({ ...newBw, depthFeet: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Submersible Motor (HP)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBw.pumpHorsepower}
                    onChange={(e) => setNewBw({ ...newBw, pumpHorsepower: Number(e.target.value) })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Secretary</label>
                  <input
                    type="text"
                    value={newBw.responsibleManager}
                    onChange={(e) => setNewBw({ ...newBw, responsibleManager: e.target.value })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={newBw.managerPhone}
                    onChange={(e) => setNewBw({ ...newBw, managerPhone: e.target.value })}
                    className="w-full p-2 border rounded-xl border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md"
                >
                  Register Borewell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
