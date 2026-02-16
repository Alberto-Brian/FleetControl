// ========================================
// FILE: src/components/dashboard/AllActivitiesDialog.tsx (CORRIGIDO)
// ========================================
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Truck, Fuel, Wrench, Users, MapPin, DollarSign,
  AlertTriangle, Activity, Search, X, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { RecentActivity } from '@/contexts/DashboardContext';

interface AllActivitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: RecentActivity[];
}

export default function AllActivitiesDialog({
  open,
  onOpenChange,
  activities,
}: AllActivitiesDialogProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filtrar atividades
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.driver?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || activity.type === filterType;

    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string) => {
    const icons = {
      trip: MapPin,
      refueling: Fuel,
      maintenance: Wrench,
      expense: DollarSign,
      fine: AlertTriangle,
      vehicle: Truck,
      driver: Users,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      trip: 'text-blue-600 bg-blue-50 border-blue-200',
      refueling: 'text-green-600 bg-green-50 border-green-200',
      maintenance: 'text-orange-600 bg-orange-50 border-orange-200',
      expense: 'text-purple-600 bg-purple-50 border-purple-200',
      fine: 'text-red-600 bg-red-50 border-red-200',
      vehicle: 'text-blue-600 bg-blue-50 border-blue-200',
      driver: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    // ✅ Configuração com traduções dinâmicas
    const statusConfig: Record<string, { key: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      in_progress: { key: 'common:status.inProgress', variant: 'default' },
      completed: { key: 'common:status.completed', variant: 'secondary' },
      scheduled: { key: 'common:status.scheduled', variant: 'outline' },
      pending: { key: 'common:status.pending', variant: 'outline' },
      paid: { key: 'common:status.paid', variant: 'secondary' },
      cancelled: { key: 'common:status.cancelled', variant: 'destructive' },
    };

    const config = statusConfig[status] || { key: status, variant: 'outline' as const };

    return (
      <Badge variant={config.variant} className="text-xs">
        {t(config.key)}
      </Badge>
    );
  };

  // ✅ Filtros com traduções dinâmicas
  const activityTypes = [
    { value: 'all', label: t('dashboard:filters.all'), count: activities.length },
    { value: 'trip', label: t('dashboard:filters.trips'), count: activities.filter(a => a.type === 'trip').length },
    { value: 'refueling', label: t('dashboard:filters.refuelings'), count: activities.filter(a => a.type === 'refueling').length },
    { value: 'maintenance', label: t('dashboard:filters.maintenances'), count: activities.filter(a => a.type === 'maintenance').length },
    { value: 'expense', label: t('dashboard:filters.expenses'), count: activities.filter(a => a.type === 'expense').length },
    { value: 'fine', label: t('dashboard:filters.fines'), count: activities.filter(a => a.type === 'fine').length },
    { value: 'vehicle', label: t('dashboard:filters.vehicles'), count: activities.filter(a => a.type === 'vehicle').length },
    { value: 'driver', label: t('dashboard:filters.drivers'), count: activities.filter(a => a.type === 'driver').length },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-primary" />
            {t('dashboard:recentActivities.allActivities')}
          </DialogTitle>
          <DialogDescription>
            {t('dashboard:recentActivities.allActivitiesDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard:recentActivities.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Tabs - ✅ COM SCROLL HORIZONTAL */}
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {activityTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={filterType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type.value)}
                  className="text-xs flex-shrink-0"
                >
                  {type.label}
                  {type.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 px-1.5 py-0 text-[10px] h-4"
                    >
                      {type.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Activities List - ✅ COM OVERFLOW CORRETO */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold mb-1">
                {searchTerm ? t('dashboard:recentActivities.noResults') : t('dashboard:recentActivities.noActivities')}
              </p>
              <p className="text-sm">
                {searchTerm && t('dashboard:recentActivities.tryDifferentSearch')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);

                return (
                  <div
                    key={activity.id}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon - ✅ FLEX-SHRINK-0 */}
                      <div className={cn("p-3 rounded-xl border flex-shrink-0", colorClass)}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content - ✅ MIN-W-0 */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1 truncate">
                              {t(activity.title)}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                              {activity.description}
                            </p>
                          </div>
                          {activity.status && (
                            <div className="flex-shrink-0">
                              {getStatusBadge(activity.status)}
                            </div>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-3">
                          {/* Date */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {new Date(activity.date).toLocaleDateString('pt-PT', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Vehicle */}
                          {activity.vehicle && (
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-mono font-medium truncate">{activity.vehicle}</span>
                            </div>
                          )}

                          {/* Driver */}
                          {activity.driver && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{activity.driver}</span>
                            </div>
                          )}

                          {/* Amount */}
                          {activity.amount && (
                            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span className="font-bold text-foreground whitespace-nowrap">
                                {(activity.amount / 1000).toFixed(1)}K Kz
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - ✅ FLEX-SHRINK-0 */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            {t('dashboard:recentActivities.showingActivities', { 
              count: filteredActivities.length,
              total: activities.length 
            })}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}