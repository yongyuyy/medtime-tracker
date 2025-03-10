
import { format } from 'date-fns';
import { TimeEntry } from '@/types';
import { formatTime, formatDurationCompact } from './timeUtils';

export const generatePdfReport = async (entries: TimeEntry[], period: string) => {
  try {
    // Create document content
    const filteredEntries = entries.filter(entry => entry.date.startsWith(period));
    const totalMinutes = filteredEntries.reduce((total, entry) => total + entry.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const regularHours = totalHours; // For simplicity, we count all as regular
    const overtimeHours = '0.0'; // Calculate overtime if needed
    
    // Generate HTML content for PDF
    const content = `
      <html>
        <head>
          <title>MedTime - Time Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            h2 { font-size: 20px; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .subtitle { font-size: 18px; margin-top: 0; color: #555; margin-bottom: 40px; }
            .summary { display: flex; justify-content: space-between; background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0 40px; }
            .summary-item { text-align: center; }
            .summary-item h3 { margin-bottom: 5px; font-weight: normal; color: #666; }
            .summary-item p { font-size: 32px; margin: 0; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #ddd; font-weight: 600; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .month-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .month-title { margin: 0; font-size: 18px; }
            .month-hours { font-size: 16px; font-weight: bold; margin: 5px 0 0; }
            hr { border: none; border-top: 1px solid #ddd; margin: 30px 0; }
          </style>
        </head>
        <body>
          <h1>MedTime - Annual Time Report</h1>
          <p class="subtitle">${period}</p>
          
          <div class="summary">
            <div class="summary-item">
              <h3>Total Hours</h3>
              <p>${totalHours}</p>
            </div>
            <div class="summary-item">
              <h3>Regular Hours</h3>
              <p>${regularHours}</p>
            </div>
            <div class="summary-item">
              <h3>Overtime Hours</h3>
              <p>${overtimeHours}</p>
            </div>
          </div>
          
          <h2>Monthly Overview</h2>
          ${getMonthlyOverview(filteredEntries, period)}
          
          <h2>${getMonthName(period)} ${period} - ${totalHours} hours</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${formatDate(entry.date)}</td>
                  <td>${formatTime(entry.timeIn)}</td>
                  <td>${entry.timeOut ? formatTime(entry.timeOut) : 'In progress'}</td>
                  <td>${entry.duration ? formatDurationCompact(entry.duration) : '-'}</td>
                  <td>${entry.notes || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Create a Blob containing the HTML content
    const blob = new Blob([content], { type: 'text/html' });
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MedTime-Report-${period}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Helper to format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return format(date, 'EEE, MMM d, yyyy');
};

// Helper to get month name from period
const getMonthName = (period: string) => {
  // If period is YYYY-MM format
  if (period.length > 4) {
    const month = parseInt(period.split('-')[1]);
    return format(new Date(2000, month - 1, 1), 'MMMM');
  }
  return '';
};

// Helper to generate monthly overview section
const getMonthlyOverview = (entries: TimeEntry[], period: string) => {
  if (period.length <= 4) { // If it's just a year
    // Group by month
    const monthlyData = entries.reduce((acc: Record<string, number>, entry) => {
      const month = entry.date.substring(5, 7); // Get month part (MM)
      if (!acc[month]) acc[month] = 0;
      acc[month] += entry.duration;
      return acc;
    }, {});
    
    return Object.entries(monthlyData).map(([month, minutes]) => {
      const monthName = format(new Date(2000, parseInt(month) - 1, 1), 'MMMM');
      const hours = (minutes / 60).toFixed(1);
      
      return `
        <div class="month-section">
          <h3 class="month-title">${monthName}</h3>
          <p class="month-hours">${hours}h</p>
        </div>
      `;
    }).join('');
  }
  
  return ''; // No monthly overview for specific month reports
};
