// ========================================
// FILE: src/components/tracking/DeviceSidebar.tsx
// ========================================
import React, { useState } from 'react';
import { Input }           from '@/components/ui/input';
import { ScrollArea }      from '@/components/ui/scroll-area';
import { Search, Wifi, WifiOff } from 'lucide-react';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { formatSpeed, getDeviceColor } from '@/helpers/tracking-helpers';

interface Props {
  devices:        TrackedDevice[];
  positions:      Position[];
  selectedDevice: TrackedDevice | null;
  filteredStatus: 'all' | 'online' | 'offline';
  onSelect:       (device: TrackedDevice) => void;
}

export function DeviceSidebar({ devices, positions, selectedDevice, filteredStatus, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uniqueId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filteredStatus === 'all' || d.status === filteredStatus;
    return matchSearch && matchStatus;
  });

  function getPosition(device: TrackedDevice): Position | undefined {
    return positions.find(p => p.deviceId === device.traccar_id);
  }

  return (
    <aside className="absolute left-3 top-[60px] bottom-4 z-10 w-64 flex flex-col rounded-xl border border-border bg-background/95 backdrop-blur shadow-xl overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Procurar dispositivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
        <span>{devices.length} dispositivos</span>
        <span className="text-green-600 font-medium">
          {devices.filter(d => d.status === 'online').length} online
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.map(device => {
            const pos        = getPosition(device);
            const isSelected = selectedDevice
              ? selectedDevice.traccar_id === device.traccar_id
              : false;
            const color = getDeviceColor(device.status, pos?.speed ?? 0);

            return (
              <button
                key={device.id}
                onClick={() => onSelect(device)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/60 border border-transparent'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pos ? formatSpeed(pos.speed ?? 0) : '0 km/h'}
                  </p>
                </div>
                {device.status === 'online'
                  ? <Wifi    className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  : <WifiOff className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                }
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum dispositivo encontrado
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}