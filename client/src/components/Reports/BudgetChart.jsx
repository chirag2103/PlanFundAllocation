import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Card from '../common/Card';

const BudgetChart = ({ proposals, type }) => {
  const prepareBudgetData = () => {
    if (!proposals || proposals.length === 0) return [];

    const departmentBudget = {};
    proposals.forEach((p) => {
      const deptName = p.department?.name || 'Unknown';
      if (!departmentBudget[deptName]) {
        departmentBudget[deptName] = 0;
      }
      if (p.status === 'approved') {
        departmentBudget[deptName] += p.totalAmount;
      }
    });

    return Object.entries(departmentBudget).map(([name, amount]) => ({
      name,
      amount: amount / 100000, // Convert to lakhs
    }));
  };

  const prepareStatusData = () => {
    if (!proposals || proposals.length === 0) return [];

    const statusCount = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
    };

    proposals.forEach((p) => {
      if (statusCount.hasOwnProperty(p.status)) {
        statusCount[p.status]++;
      }
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  const COLORS = [
    '#1a73e8',
    '#ffc107',
    '#28a745',
    '#dc3545',
    '#17a2b8',
    '#fd7e14',
  ];

  return (
    <div>
      {type === 'budget' && (
        <Card title='💰 Budget Allocation by Department'>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={prepareBudgetData()}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis
                  label={{
                    value: 'Amount (₹ Lakhs)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}L`} />
                <Legend />
                <Bar
                  dataKey='amount'
                  fill='#1a73e8'
                  name='Approved Budget (₹L)'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {type === 'status' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          <Card title='📊 Proposal Status Distribution'>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={prepareStatusData()}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {prepareStatusData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title='📈 Statistics'>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              {prepareStatusData().map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                    borderLeft: `4px solid ${COLORS[idx]}`,
                  }}
                >
                  <span>
                    <strong>{item.name}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: COLORS[idx],
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BudgetChart;
