// ========================================
// FILE: src/helpers/dashboard-helpers.ts
// ========================================

export async function loadDashboardData() {
  try {
    const [stats, activities, chartData] = await Promise.all([
      window._dashboard.getStats(),
      window._dashboard.getActivities(10),
      window._dashboard.getChartData(),
    ]);
    
    return { stats, activities, chartData };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters.toFixed(0)} m`;
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('pt-PT')} Kz`;
}

export function formatLiters(liters: number): string {
  return `${liters.toFixed(2)} L`;
}

export function getActivityIcon(type: string) {
  const icons = {
    trip: 'RouteIcon',
    refueling: 'Fuel',
    maintenance: 'Wrench',
    expense: 'DollarSign',
    fine: 'AlertTriangle',
  };
  return icons[type as keyof typeof icons] || 'FileText';
}

export function getActivityColor(type: string) {
  const colors = {
    trip: 'text-blue-600 bg-blue-50',
    refueling: 'text-green-600 bg-green-50',
    maintenance: 'text-orange-600 bg-orange-50',
    expense: 'text-purple-600 bg-purple-50',
    fine: 'text-red-600 bg-red-50',
  };
  return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
}

export function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split('-');
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}