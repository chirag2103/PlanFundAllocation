import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CycleReportView from '../components/Reports/CycleReportView';
import InstitutionalReportView from '../components/Reports/InstitutionalReportView';
import {
  exportReportToPDF,
  exportInstitutionalToPDF,
  exportToExcel,
  exportToCSV,
} from '../utils/reportExport';
import toast from 'react-hot-toast';

const Reports = () => {
  const { user } = useAuth();
  const [reportView, setReportView] = useState('cycle'); // 'cycle' or 'institutional'
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch available years
  const { data: cycles } = useQuery({
    queryKey: ['cycles-for-reports'],
    queryFn: () => api.get('/api/cycles').then((res) => res.data),
  });

  const years = cycles
    ? [...new Set(cycles.map((c) => c.academicYear))].sort().reverse()
    : [];

  // Fetch departments (only for admin)
  const { data: departments } = useQuery({
    queryKey: ['departments-for-reports'],
    queryFn: () =>
      user?.role === 'admin'
        ? api.get('/api/departments').then((res) => res.data)
        : Promise.resolve([]),
    enabled: user?.role === 'admin',
  });

  // Fetch cycle statistics
  const { data: cycleStats, isLoading: statsLoading } = useQuery({
    queryKey: ['cycle-stats', selectedCycle],
    queryFn: () =>
      selectedCycle
        ? api
            .get(`/api/reports/cycle-stats?cycleId=${selectedCycle}`)
            .then((res) => res.data)
        : Promise.resolve(null),
    enabled: !!selectedCycle && reportView === 'cycle',
  });

  // Fetch proposals with filters
  const { data: proposals } = useQuery({
    queryKey: [
      'report-proposals',
      selectedCycle,
      selectedDepartment,
      filterStatus,
      filterPriority,
      dateRange,
    ],
    queryFn: () => {
      if (!selectedCycle) return Promise.resolve([]);

      const params = new URLSearchParams();
      params.append('cycleId', selectedCycle);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (user?.role === 'admin' && selectedDepartment) {
        params.append('departmentId', selectedDepartment);
      }
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      return api
        .get(`/api/reports/proposals?${params.toString()}`)
        .then((res) => res.data);
    },
    enabled: !!selectedCycle && reportView === 'cycle',
  });

  // Fetch institutional stats (admin only, year-based)
  const { data: institutionalStats, isLoading: instStatsLoading } = useQuery({
    queryKey: ['institutional-stats', selectedYear],
    queryFn: () =>
      user?.role === 'admin' && selectedYear
        ? api
            .get(`/api/reports/institutional-stats?year=${selectedYear}`)
            .then((res) => res.data)
        : Promise.resolve(null),
    enabled: reportView === 'institutional' && user?.role === 'admin',
  });

  const handleExportPDF = () => {
    if (reportView === 'cycle' && !selectedCycle) {
      toast.error('Select a cycle to export');
      return;
    }
    if (reportView === 'institutional' && !selectedYear) {
      toast.error('Select a year to export');
      return;
    }

    setIsExporting(true);
    try {
      if (reportView === 'cycle' && cycleStats) {
        exportReportToPDF(cycleStats, proposals, user);
      } else if (reportView === 'institutional' && institutionalStats) {
        exportInstitutionalToPDF(institutionalStats, user);
      }
      toast.success('Report exported to PDF');
    } catch (error) {
      toast.error('Failed to export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (!selectedCycle && reportView === 'cycle') {
      toast.error('Select a cycle to export');
      return;
    }
    setIsExporting(true);
    try {
      if (reportView === 'cycle' && cycleStats) {
        exportToExcel(cycleStats, proposals, user);
      }
      toast.success('Report exported to Excel');
    } catch (error) {
      toast.error('Failed to export Excel: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedCycle && reportView === 'cycle') {
      toast.error('Select a cycle to export');
      return;
    }
    setIsExporting(true);
    try {
      if (reportView === 'cycle' && cycleStats) {
        exportToCSV(cycleStats, proposals, user);
      }
      toast.success('Report exported to CSV');
    } catch (error) {
      toast.error('Failed to export CSV: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='reports-page'>
      <div className='page-title'>
        <h2>📊 Reports & Analytics</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant='primary'
            onClick={handleExportPDF}
            disabled={
              isExporting ||
              (reportView === 'cycle' && !selectedCycle) ||
              (reportView === 'institutional' && !selectedYear)
            }
            size='small'
          >
            📄 PDF
          </Button>
          <Button
            variant='primary'
            onClick={handleExportExcel}
            disabled={
              isExporting ||
              (reportView === 'cycle' && !selectedCycle) ||
              reportView === 'institutional'
            }
            size='small'
          >
            📊 Excel
          </Button>
          <Button
            variant='primary'
            onClick={handleExportCSV}
            disabled={
              isExporting ||
              (reportView === 'cycle' && !selectedCycle) ||
              reportView === 'institutional'
            }
            size='small'
          >
            📥 CSV
          </Button>
        </div>
      </div>

      {/* Report View Selection - Admin Only */}
      {user?.role === 'admin' && (
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant={reportView === 'cycle' ? 'primary' : 'secondary'}
              onClick={() => {
                setReportView('cycle');
                setSelectedCycle(null);
              }}
              size='small'
            >
              🔄 Fund Cycle Report
            </Button>
            <Button
              variant={reportView === 'institutional' ? 'primary' : 'secondary'}
              onClick={() => setReportView('institutional')}
              size='small'
            >
              🏛️ Institutional Report
            </Button>
          </div>
        </Card>
      )}

      {/* CYCLE REPORT VIEW */}
      {reportView === 'cycle' && (
        <>
          {/* Cycle Selection */}
          <Card title='🔄 Select Fund Cycle' style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Fund Cycle *
                </label>
                <select
                  className='form-control'
                  value={selectedCycle || ''}
                  onChange={(e) => {
                    setSelectedCycle(e.target.value);
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setDateRange({ start: '', end: '' });
                  }}
                >
                  <option value=''>-- Select a Cycle --</option>
                  {cycles?.map((cycle) => (
                    <option key={cycle._id} value={cycle._id}>
                      {cycle.name} ({cycle.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              {/* {user?.role === 'admin' && (
                <div>
                  <label
                    style={{
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Department (Optional)
                  </label>
                  <select
                    className='form-control'
                    value={selectedDepartment || ''}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value=''>-- All Departments --</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              )} */}
            </div>
          </Card>

          {/* Filters */}
          {selectedCycle && (
            <Card title='🔍 Filters' style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Status
                  </label>
                  <select
                    className='form-control'
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value='all'>All</option>
                    <option value='draft'>Draft</option>
                    <option value='submitted'>Submitted</option>
                    <option value='approved'>Approved</option>
                    <option value='rejected'>Rejected</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Priority
                  </label>
                  <select
                    className='form-control'
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value='all'>All</option>
                    <option value='high'>High</option>
                    <option value='medium'>Medium</option>
                    <option value='low'>Low</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    Start Date
                  </label>
                  <input
                    type='date'
                    className='form-control'
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  >
                    End Date
                  </label>
                  <input
                    type='date'
                    className='form-control'
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Cycle Report Display */}
          {statsLoading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <div className='spinner'></div>
                <p>Loading statistics...</p>
              </div>
            </Card>
          ) : cycleStats ? (
            <CycleReportView
              stats={cycleStats}
              proposals={proposals || []}
              user={user}
            />
          ) : null}
        </>
      )}

      {/* INSTITUTIONAL REPORT VIEW */}
      {reportView === 'institutional' && user?.role === 'admin' && (
        <>
          {/* Year Selection */}
          <Card
            title='📅 Select Academic Year'
            style={{ marginBottom: '20px' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Academic Year *
                </label>
                <select
                  className='form-control'
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Institutional Report Display */}
          {instStatsLoading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <div className='spinner'></div>
                <p>Loading institutional report...</p>
              </div>
            </Card>
          ) : institutionalStats ? (
            <InstitutionalReportView stats={institutionalStats} user={user} />
          ) : null}
        </>
      )}
    </div>
  );
};

export default Reports;
