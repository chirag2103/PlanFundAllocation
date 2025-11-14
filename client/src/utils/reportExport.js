import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

// ==========================================
// CYCLE REPORT PDF EXPORT
// ==========================================
export const exportReportToPDF = (stats, proposals, user) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 15px; 
          color: #333; 
          line-height: 1.6;
          font-size: 12px;
        }
        h1 { 
          text-align: center; 
          color: #007bff; 
          margin-bottom: 5px; 
          font-size: 24px;
          border-bottom: 3px solid #007bff;
          padding-bottom: 10px;
        }
        h3 { 
          margin-top: 20px; 
          margin-bottom: 12px; 
          color: #007bff; 
          border-bottom: 2px solid #007bff; 
          padding-bottom: 5px; 
          font-size: 16px;
        }
        .meta { 
          text-align: center; 
          margin-bottom: 20px; 
          font-size: 12px; 
          color: #666;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 5px;
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); 
          gap: 12px; 
          margin: 15px 0;
        }
        .stat-box { 
          border: 2px solid #007bff; 
          padding: 12px; 
          border-radius: 5px; 
          background-color: #f9f9f9;
          text-align: center;
        }
        .stat-value { 
          font-size: 18px; 
          font-weight: bold; 
          color: #007bff;
        }
        .stat-label { 
          font-size: 11px; 
          color: #666; 
          margin-top: 3px;
          font-weight: 600;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 12px 0;
          font-size: 11px;
        }
        th { 
          background-color: #007bff; 
          color: white; 
          padding: 8px; 
          text-align: left; 
          font-weight: 600;
          border: 1px solid #0056b3;
        }
        td { 
          padding: 8px; 
          border-bottom: 1px solid #ddd;
          border-left: 1px solid #ddd;
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f0f0f0;
        }
        .status-badge { 
          display: inline-block; 
          padding: 3px 6px; 
          border-radius: 3px; 
          font-size: 10px; 
          font-weight: bold; 
          color: white;
        }
        .badge-approved { background-color: #28a745; }
        .badge-rejected { background-color: #dc3545; }
        .badge-submitted { background-color: #17a2b8; }
        .badge-draft { background-color: #ffc107; color: black; }
        .badge-high { background-color: #dc3545; }
        .badge-medium { background-color: #ffc107; color: black; }
        .badge-low { background-color: #17a2b8; }
        .action-approved { color: #28a745; font-weight: bold; }
        .action-rejected { color: #dc3545; font-weight: bold; }
        .action-pending { color: #ffc107; font-weight: bold; }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
      </style>
    </head>
    <body>
      <h1>📊 Fund Cycle Report</h1>
      <div class="meta">
        <p><strong>Cycle:</strong> ${
          stats.cycleName
        } | <strong>Year:</strong> ${stats.cycleYear}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString(
          'en-IN'
        )} at ${new Date().toLocaleTimeString('en-IN')}</p>
      </div>

      <h3>💰 Budget Summary</h3>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">₹${(stats.allocatedBudget / 100000).toFixed(
            1
          )}L</div>
          <div class="stat-label">Allocated</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">₹${(stats.totalRequested / 100000).toFixed(
            1
          )}L</div>
          <div class="stat-label">Requested</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">₹${(stats.totalApproved / 100000).toFixed(
            1
          )}L</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Number(stats.utilizationRate).toFixed(
            1
          )}%</div>
          <div class="stat-label">Utilization</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Number(stats.approvalRate).toFixed(
            1
          )}%</div>
          <div class="stat-label">Approval Rate</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalProposals}</div>
          <div class="stat-label">Total Proposals</div>
        </div>
      </div>

      <h3>📋 Status & Priority Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th colspan="2">📊 Status</th>
            <th colspan="2">🎯 Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>✅ Approved</td>
            <td>${stats.approvedCount}</td>
            <td>🔴 High</td>
            <td>${stats.byPriority.high}</td>
          </tr>
          <tr>
            <td>❌ Rejected</td>
            <td>${stats.rejectedCount}</td>
            <td>🟡 Medium</td>
            <td>${stats.byPriority.medium}</td>
          </tr>
          <tr>
            <td>📤 Submitted</td>
            <td>${stats.submittedCount}</td>
            <td>🟢 Low</td>
            <td>${stats.byPriority.low}</td>
          </tr>
          <tr>
            <td>📝 Draft</td>
            <td>${stats.draftCount}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <h3>📦 Budget by Category</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Items</th>
            <th>Requested</th>
            <th>Approved</th>
            <th>Utilization %</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(stats.byCategory || {})
            .map(
              ([category, data]) => `
            <tr>
              <td><strong>${
                category.charAt(0).toUpperCase() + category.slice(1)
              }</strong></td>
              <td>${data.count}</td>
              <td>₹${(data.requested / 100000).toFixed(1)}L</td>
              <td>₹${(data.approved / 100000).toFixed(1)}L</td>
              <td>${
                data.requested > 0
                  ? Number(((data.approved / data.requested) * 100).toFixed(1))
                  : 0
              }%</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h3>📋 All Proposals - Acceptance/Rejection Status</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Faculty</th>
            <th>Amount (₹L)</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Submitted</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          ${proposals
            .map(
              (proposal) => `
            <tr>
              <td>${
                proposal.proposalId?.substring(0, 8) ||
                proposal._id.substring(0, 8)
              }</td>
              <td>${proposal.faculty?.name || 'N/A'}</td>
              <td>₹${(proposal.totalAmount / 100000).toFixed(2)}L</td>
              <td><span class="status-badge badge-${proposal.status}">${
                proposal.status.charAt(0).toUpperCase() +
                proposal.status.slice(1)
              }</span></td>
              <td><span class="status-badge badge-${proposal.priority}">${
                proposal.priority.charAt(0).toUpperCase() +
                proposal.priority.slice(1)
              }</span></td>
              <td>${new Date(
                proposal.submittedAt ? proposal.submittedAt : proposal.updatedAt
              ).toLocaleDateString('en-IN')}</td>
              <td>
                ${
                  proposal.status === 'approved'
                    ? '<span class="action-approved">✅ ACCEPTED</span>'
                    : proposal.status === 'rejected'
                    ? '<span class="action-rejected">❌ REJECTED</span>'
                    : proposal.status === 'submitted'
                    ? '<span class="action-pending">⏳ PENDING</span>'
                    : '<span>📝 DRAFT</span>'
                }
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const options = {
    margin: 8,
    filename: `report-${stats.cycleName}-${new Date().toLocaleDateString(
      'en-IN'
    )}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  html2pdf().set(options).from(htmlContent).save();
};

// ==========================================
// INSTITUTIONAL REPORT PDF EXPORT
// ==========================================
export const exportInstitutionalToPDF = (stats, user) => {
  const sortedDepts = Object.values(stats.departmentStats || {}).sort(
    (a, b) => b.totalApproved - a.totalApproved
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 12px; 
          color: #333; 
          line-height: 1.5;
          font-size: 10px;
        }
        h1 { 
          text-align: center; 
          color: #007bff; 
          margin-bottom: 3px; 
          font-size: 20px;
          border-bottom: 3px solid #007bff;
          padding-bottom: 8px;
        }
        h3 { 
          margin-top: 15px; 
          margin-bottom: 10px; 
          color: #007bff; 
          border-bottom: 2px solid #007bff; 
          padding-bottom: 3px; 
          font-size: 13px;
        }
        .meta { 
          text-align: center; 
          margin-bottom: 15px; 
          font-size: 9px; 
          color: #666;
          background-color: #f0f0f0;
          padding: 8px;
          border-radius: 5px;
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); 
          gap: 10px; 
          margin: 12px 0;
        }
        .stat-box { 
          border: 2px solid #007bff; 
          padding: 10px; 
          border-radius: 5px; 
          background-color: #f9f9f9;
          text-align: center;
        }
        .stat-value { 
          font-size: 15px; 
          font-weight: bold; 
          color: #007bff;
        }
        .stat-label { 
          font-size: 8px; 
          color: #666; 
          margin-top: 2px;
          font-weight: 600;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 10px 0;
          font-size: 9px;
        }
        th { 
          background-color: #007bff; 
          color: white; 
          padding: 6px; 
          text-align: left; 
          font-weight: 600;
          border: 1px solid #0056b3;
        }
        td { 
          padding: 6px; 
          border-bottom: 1px solid #ddd;
          border-left: 1px solid #ddd;
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9;
        }
        .badge { 
          display: inline-block; 
          padding: 2px 5px; 
          border-radius: 3px; 
          font-size: 8px; 
          font-weight: bold; 
          color: white;
        }
        .badge-success { background-color: #28a745; }
        .badge-danger { background-color: #dc3545; }
        .badge-info { background-color: #17a2b8; }
        .badge-warning { background-color: #ffc107; color: black; }
      </style>
    </head>
    <body>
      <h1>🏛️ Institutional Report - Year ${stats.year}</h1>
      <div class="meta">
        <p><strong>Total Cycles:</strong> ${
          stats.cycles
        } | <strong>Total Departments:</strong> ${stats.totalDepartments}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString(
          'en-IN'
        )} at ${new Date().toLocaleTimeString('en-IN')}</p>
      </div>

      <h3>📊 Overall Summary (All Departments & Cycles)</h3>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${stats.totalProposals}</div>
          <div class="stat-label">Total Proposals</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalApproved}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalRejected}</div>
          <div class="stat-label">Rejected</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.totalSubmitted}</div>
          <div class="stat-label">Submitted</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">₹${(stats.totalRequested / 10000000).toFixed(
            1
          )}Cr</div>
          <div class="stat-label">Requested</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">₹${(
            stats.totalApprovedAmount / 10000000
          ).toFixed(1)}Cr</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Number(stats.overallApprovalRate).toFixed(
            1
          )}%</div>
          <div class="stat-label">Approval Rate</div>
        </div>
      </div>

      <h3>🏢 Department-wise Budget Allocation</h3>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Code</th>
            <th>Total</th>
            <th>✅ Approved</th>
            <th>❌ Rejected</th>
            <th>Budget (₹L)</th>
            <th>Requested (₹L)</th>
            <th>Approved (₹L)</th>
            <th>Util %</th>
          </tr>
        </thead>
        <tbody>
          ${sortedDepts
            .map(
              (dept) => `
            <tr>
              <td><strong>${dept.name}</strong></td>
              <td>${dept.code}</td>
              <td>${dept.totalProposals}</td>
              <td><span class="badge badge-success">${
                dept.approvedProposals
              }</span></td>
              <td><span class="badge badge-danger">${
                dept.rejectedProposals
              }</span></td>
              <td>₹${((dept.budget || 0) / 100000).toFixed(1)}L</td>
              <td>₹${((dept.totalRequested || 0) / 100000).toFixed(1)}L</td>
              <td>₹${((dept.totalApproved || 0) / 100000).toFixed(1)}L</td>
              <td>${Number(dept.utilizationRate || 0).toFixed(1)}%</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h3>📋 All Proposals in Academic Year ${stats.year}</h3>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Faculty</th>
            <th>Proposal ID</th>
            <th>Amount (₹L)</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Fund Cycle</th>
            <th>Submitted</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          ${stats.proposals
            .map(
              (proposal) => `
            <tr>
              <td>${proposal.department?.name || 'N/A'}</td>
              <td>${proposal.faculty?.name || 'N/A'}</td>
              <td>${
                proposal.proposalId?.substring(0, 6) ||
                proposal._id.substring(0, 6)
              }</td>
              <td>₹${(proposal.totalAmount / 100000).toFixed(2)}L</td>
              <td><span class="badge ${
                proposal.status === 'approved'
                  ? 'badge-success'
                  : proposal.status === 'rejected'
                  ? 'badge-danger'
                  : proposal.status === 'submitted'
                  ? 'badge-info'
                  : 'badge-warning'
              }">${proposal.status.substring(0, 3).toUpperCase()}</span></td>
              <td>${proposal.priority.substring(0, 1).toUpperCase()}</td>
              <td>${proposal.fundCycle?.name || 'N/A'}</td>
              <td>${new Date(
                proposal.submittedAt ? proposal.submittedAt : proposal.updatedAt
              ).toLocaleDateString('en-IN')}</td>
              <td style="font-weight: bold;">
                ${
                  proposal.status === 'approved'
                    ? '<span style="color: #28a745;">✅ ACCEPTED</span>'
                    : proposal.status === 'rejected'
                    ? '<span style="color: #dc3545;">❌ REJECTED</span>'
                    : '<span style="color: #ffc107;">⏳ PENDING</span>'
                }
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const options = {
    margin: 8,
    filename: `institutional-report-${
      stats.year
    }-${new Date().toLocaleDateString('en-IN')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
  };

  html2pdf().set(options).from(htmlContent).save();
};

// ==========================================
// CYCLE REPORT EXCEL EXPORT
// ==========================================
export const exportToExcel = (stats, proposals, user) => {
  const workbook = XLSX.utils.book_new();

  // ===== SUMMARY SHEET =====
  const summaryData = [
    ['FUND CYCLE REPORT'],
    [],
    ['Cycle Name', stats.cycleName],
    ['Academic Year', stats.cycleYear],
    ['Generated Date', new Date().toLocaleDateString('en-IN')],
    ['Generated Time', new Date().toLocaleTimeString('en-IN')],
    [],
    ['BUDGET SUMMARY'],
    ['Metric', 'Value'],
    ['Allocated Budget (₹L)', (stats.allocatedBudget / 100000).toFixed(2)],
    ['Total Requested (₹L)', (stats.totalRequested / 100000).toFixed(2)],
    ['Total Approved (₹L)', (stats.totalApproved / 100000).toFixed(2)],
    [
      'Remaining Budget (₹L)',
      ((stats.allocatedBudget - stats.totalApproved) / 100000).toFixed(2),
    ],
    ['Utilization Rate (%)', Number(stats.utilizationRate).toFixed(1)],
    ['Approval Rate (%)', Number(stats.approvalRate).toFixed(1)],
    [],
    ['PROPOSAL STATUS'],
    ['Status', 'Count'],
    ['Approved', stats.approvedCount],
    ['Rejected', stats.rejectedCount],
    ['Submitted', stats.submittedCount],
    ['Draft', stats.draftCount],
    ['Total', stats.totalProposals],
    [],
    ['PRIORITY BREAKDOWN'],
    ['Priority', 'Count'],
    ['High', stats.byPriority.high],
    ['Medium', stats.byPriority.medium],
    ['Low', stats.byPriority.low],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // ===== CATEGORY SHEET =====
  const categoryData = [
    ['BUDGET BY CATEGORY'],
    [],
    ['Category', 'Items', 'Requested (₹L)', 'Approved (₹L)', 'Utilization %'],
    ...Object.entries(stats.byCategory || {}).map(([category, data]) => [
      category.charAt(0).toUpperCase() + category.slice(1),
      data.count,
      (data.requested / 100000).toFixed(2),
      (data.approved / 100000).toFixed(2),
      data.requested > 0
        ? Number(((data.approved / data.requested) * 100).toFixed(1))
        : 0,
    ]),
  ];

  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
  categorySheet['!cols'] = [
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category');

  // ===== PROPOSALS SHEET =====
  const proposalData = [
    ['ALL PROPOSALS'],
    [],
    [
      'Proposal ID',
      'Faculty Name',
      'Amount (₹L)',
      'Status',
      'Priority',
      'Submitted Date',
      'Decision',
    ],
    ...proposals.map((p) => [
      p.proposalId?.substring(0, 8) || p._id.substring(0, 8),
      p.faculty?.name || 'N/A',
      (p.totalAmount / 100000).toFixed(2),
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
      p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
      new Date(p.submittedAt).toLocaleDateString('en-IN'),
      p.status === 'approved'
        ? 'ACCEPTED'
        : p.status === 'rejected'
        ? 'REJECTED'
        : 'PENDING',
    ]),
  ];

  const proposalSheet = XLSX.utils.aoa_to_sheet(proposalData);
  proposalSheet['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, proposalSheet, 'Proposals');

  // Save file
  XLSX.writeFile(
    workbook,
    `report-${stats.cycleName}-${new Date().toLocaleDateString('en-IN')}.xlsx`
  );
};

// ==========================================
// CYCLE REPORT CSV EXPORT
// ==========================================
export const exportToCSV = (stats, proposals, user) => {
  let csv = 'FUND CYCLE REPORT\n\n';

  // Header Info
  csv += `Cycle Name,${stats.cycleName}\n`;
  csv += `Academic Year,${stats.cycleYear}\n`;
  csv += `Generated,${new Date().toLocaleDateString(
    'en-IN'
  )} ${new Date().toLocaleTimeString('en-IN')}\n\n`;

  // Budget Summary
  csv += 'BUDGET SUMMARY\n';
  csv += 'Metric,Value\n';
  csv += `Allocated Budget (₹L),${(stats.allocatedBudget / 100000).toFixed(
    2
  )}\n`;
  csv += `Total Requested (₹L),${(stats.totalRequested / 100000).toFixed(2)}\n`;
  csv += `Total Approved (₹L),${(stats.totalApproved / 100000).toFixed(2)}\n`;
  csv += `Utilization Rate (%),${Number(stats.utilizationRate).toFixed(1)}\n`;
  csv += `Approval Rate (%),${Number(stats.approvalRate).toFixed(1)}\n\n`;

  // Status Breakdown
  csv += 'PROPOSAL STATUS\n';
  csv += 'Status,Count\n';
  csv += `Approved,${stats.approvedCount}\n`;
  csv += `Rejected,${stats.rejectedCount}\n`;
  csv += `Submitted,${stats.submittedCount}\n`;
  csv += `Draft,${stats.draftCount}\n`;
  csv += `Total,${stats.totalProposals}\n\n`;

  // Category Breakdown
  csv += 'BUDGET BY CATEGORY\n';
  csv += 'Category,Items,Requested (₹L),Approved (₹L),Utilization %\n';
  Object.entries(stats.byCategory || {}).forEach(([category, data]) => {
    csv += `${category},${data.count},${(data.requested / 100000).toFixed(
      2
    )},${(data.approved / 100000).toFixed(2)},${
      data.requested > 0
        ? Number(((data.approved / data.requested) * 100).toFixed(1))
        : 0
    }\n`;
  });

  // Proposals
  csv += '\nALL PROPOSALS\n';
  csv +=
    'Proposal ID,Faculty,Amount (₹L),Status,Priority,Submitted Date,Decision\n';
  proposals.forEach((p) => {
    csv += `${p.proposalId?.substring(0, 8) || p._id.substring(0, 8)},${
      p.faculty?.name || 'N/A'
    },${(p.totalAmount / 100000).toFixed(2)},${p.status},${
      p.priority
    },${new Date(p.submittedAt).toLocaleDateString('en-IN')},${
      p.status === 'approved'
        ? 'ACCEPTED'
        : p.status === 'rejected'
        ? 'REJECTED'
        : 'PENDING'
    }\n`;
  });

  // Download
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  );
  element.setAttribute(
    'download',
    `report-${stats.cycleName}-${new Date().toLocaleDateString('en-IN')}.csv`
  );
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
