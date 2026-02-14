// ========================================
// FILE: src/pages/DashboardPage.tsx
// ========================================
import React from 'react';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { DashboardPageContent } from '@/pages/provider/DashboardPageContent'

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardPageContent />
    </DashboardProvider>
  );
}


// import React from 'react';
// import { 
//   Truck, Fuel, Wrench, Users, MapPin, DollarSign, 
//   AlertTriangle, Calendar, TrendingUp, Activity, Bell,
//   ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter,
//   Download, ChevronRight
// } from 'lucide-react';
// import { 
//   LineChart, Line, AreaChart, Area, BarChart, Bar, 
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
//   PieChart, Pie, Cell, Legend 
// } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Table, TableBody, TableCell, TableHead, 
//   TableHeader, TableRow 
// } from '@/components/ui/table';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import StatCard from '@/components/StatCard';
// import VehicleStatusBadge from '@/components/VehicleStatusBadge';
// import TripStatusBadge from '@/components/TripStatusBadge';
// import AlertItem from '@/components/AlertItem';

// // Mock data expandido para gráficos
// const mockStats = {
//   totalVehicles: 24,
//   activeVehicles: 18,
//   totalDrivers: 32,
//   activeTrips: 5,
//   monthlyFuel: 15420.50,
//   pendingMaintenance: 3,
//   documentsExpiring: 7,
//   monthlyExpenses: 89340.00
// };

// const fuelConsumptionData = [
//   { name: 'Jan', value: 4000 },
//   { name: 'Fev', value: 3000 },
//   { name: 'Mar', value: 2000 },
//   { name: 'Abr', value: 2780 },
//   { name: 'Mai', value: 1890 },
//   { name: 'Jun', value: 2390 },
//   { name: 'Jul', value: 3490 },
// ];

// const fleetStatusData = [
//   { name: 'Ativos', value: 18, color: '#10b981' },
//   { name: 'Manutenção', value: 3, color: '#f59e0b' },
//   { name: 'Inativos', value: 3, color: '#ef4444' },
// ];

// const expenseData = [
//   { name: 'Semana 1', fuel: 4000, maintenance: 2400, other: 2400 },
//   { name: 'Semana 2', fuel: 3000, maintenance: 1398, other: 2210 },
//   { name: 'Semana 3', fuel: 2000, maintenance: 9800, other: 2290 },
//   { name: 'Semana 4', fuel: 2780, maintenance: 3908, other: 2000 },
// ];

// const mockVehicles = [
//   { id: '1', plate: 'LD-45-32-AB', model: 'Mercedes Sprinter', status: 'active' as const, driver: 'João Silva', km: 45230, lastService: '10/12/2025' },
//   { id: '2', plate: 'LD-78-21-CD', model: 'Iveco Daily', status: 'maintenance' as const, driver: null, km: 78450, lastService: '05/01/2026' },
//   { id: '3', plate: 'LD-12-98-EF', model: 'Ford Transit', status: 'active' as const, driver: 'Maria Santos', km: 32100, lastService: '15/11/2025' },
//   { id: '4', plate: 'LD-56-43-GH', model: 'Fiat Ducato', status: 'inactive' as const, driver: null, km: 67890, lastService: '20/10/2025' },
//   { id: '5', plate: 'LD-89-12-IJ', model: 'Renault Master', status: 'active' as const, driver: 'Carlos Costa', km: 23450, lastService: '02/01/2026' },
// ];

// const mockAlerts = [
//   { id: '1', type: 'document' as const, title: 'Seguro vence em 5 dias', vehicle: 'LD-45-32-AB', severity: 'high' as const, time: '2h atrás' },
//   { id: '2', type: 'maintenance' as const, title: 'Manutenção programada', vehicle: 'LD-78-21-CD', severity: 'medium' as const, time: '5h atrás' },
//   { id: '3', type: 'license' as const, title: 'CNH vence em 15 dias', driver: 'Ana Mendes', severity: 'medium' as const, time: '1d atrás' },
//   { id: '4', type: 'document' as const, title: 'Inspeção vencida', vehicle: 'LD-12-98-EF', severity: 'high' as const, time: '2d atrás' },
// ];

// export default function DashboardPage() {
//   return (
//     <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Dashboard de Gestão</h1>
//           <p className="text-muted-foreground">Bem-vindo de volta. Aqui está o resumo da sua frota hoje.</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" className="hidden sm:flex">
//             <Download className="w-4 h-4 mr-2" /> Exportar
//           </Button>
//           <Button size="sm">
//             <Filter className="w-4 h-4 mr-2" /> Filtros
//           </Button>
//         </div>
//       </div>

//       {/* Stats Grid - Enhanced with Trends */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard 
//           icon={Truck}
//           title="Veículos em Operação"
//           value={mockStats.activeVehicles}
//           subtitle={`${mockStats.totalVehicles} veículos totais`}
//           trend={5.2}
//           color="bg-blue-600"
//         />
//         <StatCard 
//           icon={Users}
//           title="Motoristas Ativos"
//           value={mockStats.totalDrivers}
//           subtitle="Disponíveis para viagens"
//           trend={2.1}
//           color="bg-emerald-600"
//         />
//         <StatCard 
//           icon={MapPin}
//           title="Viagens Ativas"
//           value={mockStats.activeTrips}
//           subtitle="Em andamento hoje"
//           trend={-1.4}
//           color="bg-violet-600"
//         />
//         <StatCard 
//           icon={AlertTriangle}
//           title="Alertas Pendentes"
//           value={mockStats.documentsExpiring}
//           subtitle={`${mockStats.pendingMaintenance} manutenções`}
//           trend={12}
//           color="bg-amber-600"
//         />
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Chart - Fuel Consumption */}
//         <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Consumo de Combustível</CardTitle>
//                 <CardDescription>Análise mensal de gastos com combustível (Kz)</CardDescription>
//               </div>
//               <Badge variant="secondary" className="font-mono">2026</Badge>
//             </div>
//           </CardHeader>
//           <CardContent className="pt-4">
//             <div className="h-[300px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={fuelConsumptionData}>
//                   <defs>
//                     <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
//                       <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
//                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
//                   <Tooltip 
//                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//                   />
//                   <Area 
//                     type="monotone" 
//                     dataKey="value" 
//                     stroke="#2563eb" 
//                     strokeWidth={2}
//                     fillOpacity={1} 
//                     fill="url(#colorFuel)" 
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Fleet Distribution Pie Chart */}
//         <Card className="shadow-sm border-slate-200 dark:border-slate-800">
//           <CardHeader>
//             <CardTitle>Status da Frota</CardTitle>
//             <CardDescription>Distribuição atual dos veículos</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[250px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={fleetStatusData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={5}
//                     dataKey="value"
//                   >
//                     {fleetStatusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend verticalAlign="bottom" height={36}/>
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//             <div className="mt-4 space-y-2">
//               {fleetStatusData.map((item) => (
//                 <div key={item.name} className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
//                     <span className="text-muted-foreground">{item.name}</span>
//                   </div>
//                   <span className="font-medium">{item.value}</span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Tables and Alerts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Detailed Fleet Table */}
//         <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle>Lista de Veículos</CardTitle>
//               <CardDescription>Detalhes técnicos e status em tempo real</CardDescription>
//             </div>
//             <Button variant="ghost" size="sm" className="text-blue-600">
//               Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
//             </Button>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Veículo</TableHead>
//                   <TableHead>Motorista</TableHead>
//                   <TableHead>Quilometragem</TableHead>
//                   <TableHead>Última Revisão</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right"></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {mockVehicles.map((vehicle) => (
//                   <TableRow key={vehicle.id} className="group">
//                     <TableCell>
//                       <div className="flex flex-col">
//                         <span className="font-bold">{vehicle.plate}</span>
//                         <span className="text-xs text-muted-foreground">{vehicle.model}</span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-sm">
//                       {vehicle.driver || <span className="text-slate-400 italic">Disponível</span>}
//                     </TableCell>
//                     <TableCell className="text-sm font-mono">
//                       {vehicle.km.toLocaleString()} km
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">
//                       {vehicle.lastService}
//                     </TableCell>
//                     <TableCell>
//                       <VehicleStatusBadge status={vehicle.status} />
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
//                             <MoreHorizontal className="w-4 h-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
//                           <DropdownMenuItem>Editar</DropdownMenuItem>
//                           <DropdownMenuItem className="text-red-600">Relatar Problema</DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         {/* Alerts and Notifications */}
//         <Card className="shadow-sm border-slate-200 dark:border-slate-800">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center gap-2">
//                 <Bell className="w-5 h-5 text-blue-600" />
//                 Alertas Críticos
//               </CardTitle>
//               <Badge variant="destructive" className="rounded-full px-2">{mockAlerts.length}</Badge>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-[400px] pr-4">
//               <div className="space-y-4">
//                 {mockAlerts.map((alert) => (
//                   <div key={alert.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer">
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2 rounded-lg ${
//                         alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
//                       }`}>
//                         <AlertTriangle className="w-4 h-4" />
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center justify-between">
//                           <p className="text-sm font-semibold">{alert.title}</p>
//                           <span className="text-[10px] text-muted-foreground">{alert.time}</span>
//                         </div>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           {alert.vehicle ? `Veículo: ${alert.vehicle}` : `Motorista: ${alert.driver}`}
//                         </p>
//                         <div className="mt-2 flex gap-2">
//                           <Button variant="link" className="h-auto p-0 text-xs text-blue-600">Resolver</Button>
//                           <Button variant="link" className="h-auto p-0 text-xs text-slate-400">Ignorar</Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>
//             <Button variant="outline" className="w-full mt-4 text-xs">
//               Ver Histórico de Alertas
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Bottom Summary - Expenses Bar Chart */}
//       <Card className="shadow-sm border-slate-200 dark:border-slate-800">
//         <CardHeader>
//           <CardTitle>Resumo de Despesas Semanais</CardTitle>
//           <CardDescription>Comparativo entre combustível, manutenção e outros custos</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[200px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={expenseData}>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
//                 <YAxis axisLine={false} tickLine={false} />
//                 <Tooltip 
//                   cursor={{fill: 'transparent'}}
//                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//                 />
//                 <Legend />
//                 <Bar dataKey="fuel" name="Combustível" fill="#2563eb" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="maintenance" name="Manutenção" fill="#f59e0b" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="other" name="Outros" fill="#94a3b8" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
